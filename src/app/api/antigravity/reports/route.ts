import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canAccessBrand } from "@/lib/session";
import { processReports } from "@/lib/antigravity/process-reports";
import { Marketplace, ReportStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only OWNER/ADMIN can upload
    if (!["SUPER_ADMIN", "CLIENT_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Only OWNER/ADMIN can upload reports" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    
    // Support either brandId or clientId (Client-based upload flow)
    let brandId = formData.get("brandId") as string;
    const clientId = formData.get("clientId") as string;
    const marketplace = formData.get("marketplace") as Marketplace;
    const kelolaFile = formData.get("kelolaFile") as File | null;
    const incomeFile = formData.get("incomeFile") as File | null;

    if (!brandId && !clientId) {
        return NextResponse.json({ error: "Brand or Client must be selected" }, { status: 400 });
    }

    // If clientId provided, resolve to Brand (Find or Create)
    if (clientId) {
        console.log(`Report Upload: Resolving brand for ClientID=${clientId}, Marketplace=${marketplace}`);
        // Find existing brand for this client + marketplace
        const existingBrand = await prisma.brand.findFirst({
           where: {
               clientId,
               marketplace, 
               isActive: true
           }
        });
        console.log("Report Upload: Existing brand found?", existingBrand ? existingBrand.id : "NO");

        if (existingBrand) {
            brandId = existingBrand.id;
        } else {
            // Auto-create brand for this client
            const client = await prisma.client.findUnique({
                where: { id: clientId }
            });
            
            if (!client) {
                return NextResponse.json({ error: "Client not found" }, { status: 404 });
            }

            const newBrand = await prisma.brand.create({
                data: {
                    clientId,
                    name: `${client.name}`,
                    marketplace,
                    description: `Auto-created brand for ${client.name}`
                }
            });
            console.log("Report Upload: Created new brand", newBrand.id);
            brandId = newBrand.id;
            
            // Auto-assign owner permission if needed
            try {
                await prisma.brandMembership.create({
                   data: {
                       userId: user.id,
                       brandId,
                       role: "OWNER"
                   }
                });
            } catch (ignored) {
                // Ignore if already exists (should not happen for new brand)
            }
        }
    }

    // Validate required fields
    if (!brandId || !marketplace || !kelolaFile || !incomeFile) {
      return NextResponse.json(
        { error: "Missing required fields: brandId, marketplace, kelolaFile, incomeFile" },
        { status: 400 }
      );
    }

    // Verify brand exists and get details
    const brand = await prisma.brand.findUnique({
        where: { id: brandId }
    });

    if (!brand) {
         return NextResponse.json({ error: "Brand not found after resolution" }, { status: 404 });
    }

    // Create report record (PROCESSING status)
    const report = await prisma.antigravityReport.create({
      data: {
        clientId: brand.clientId,
        brandId: brandId,
        marketplace: marketplace,
        status: ReportStatus.PROCESSING,
        kelolaFileName: kelolaFile.name,
        incomeFileName: incomeFile.name,
        uploadedById: user.id,
      },
    });

    try {
      // Read file buffers
      const kelolaBuffer = await kelolaFile.arrayBuffer();
      const incomeBuffer = await incomeFile.arrayBuffer();

      let result;
      let summaryResponse;

      if (marketplace === "SHOPEE") {
        const { processShopeeReports } = await import("@/lib/antigravity/shopeeEngine");
        const shopeeResult = processShopeeReports(Buffer.from(kelolaBuffer), Buffer.from(incomeBuffer));
        result = shopeeResult;
        
        // Normalize summary for response (Frontend expects TikTok structure)
        summaryResponse = {
           totalOrders: shopeeResult.summaryGlobal.totalOrderKelola,
           totalMatchedOrders: shopeeResult.summaryGlobal.totalSettlementFound,
           totalUnmatchedKelola: shopeeResult.summaryGlobal.orderWithoutSettlement,
           totalUnmatchedIncome: shopeeResult.summaryGlobal.settlementWithoutKelola,
           totalSettlement: shopeeResult.summaryGlobal.totalSettlementAmount,
           totalRevenue: shopeeResult.summaryGlobal.totalRevenue,
           totalFees: shopeeResult.summaryGlobal.totalFees,
           dateRange: {
               from: shopeeResult.summaryDaily[0]?.date || "",
               to: shopeeResult.summaryDaily[shopeeResult.summaryDaily.length - 1]?.date || ""
           }
        };
      } else {
        // Default to TikTok
        result = await processReports(kelolaBuffer, incomeBuffer);
        summaryResponse = result.summaryGlobal;
      }

      // Update report with result
      await prisma.antigravityReport.update({
        where: { id: report.id },
        data: {
          status: ReportStatus.DONE,
          resultJson: result as object,
          processedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        reportId: report.id,
        summary: summaryResponse,
      });
    } catch (processError) {
      // Update report with error
      await prisma.antigravityReport.update({
        where: { id: report.id },
        data: {
          status: ReportStatus.FAILED,
          errorJson: {
            message: processError instanceof Error ? processError.message : "Unknown error",
            stack: processError instanceof Error ? processError.stack : undefined,
          },
        },
      });

      return NextResponse.json(
        {
          error: "Failed to process reports",
          details: processError instanceof Error ? processError.message : "Unknown error",
          reportId: report.id,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
