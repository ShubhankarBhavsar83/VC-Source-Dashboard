import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CompanyModel } from "@/lib/models/Company";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const company = await CompanyModel.findById(id).lean();
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ company });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();
    const updated = await CompanyModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).lean();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ company: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}