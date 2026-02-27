import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CompanyModel } from "@/lib/models/Company";
import { seedDatabase } from "@/lib/seed";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await seedDatabase();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const stages = searchParams.getAll("stage");
    const sectors = searchParams.getAll("sector");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const filter: Record<string, unknown> = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
        { sector: { $regex: query, $options: "i" } },
      ];
    }
    if (stages.length) filter.stage = { $in: stages };
    if (sectors.length) filter.sector = { $in: sectors };

    const total = await CompanyModel.countDocuments(filter);
    const companies = await CompanyModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ companies, total, page, limit });
  } catch (error) {
    console.error("Companies GET error:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}