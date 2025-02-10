import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const response = await axios.post("http://localhost:6536/generate-meme", {
    idea: body.prompt,
  });
  console.log(response.status);

  if (response.status !== 200) {
    return new Response("Failed to generate meme", { status: 500 });
  }

  const result = response.data;

  return NextResponse.json(result);
}
