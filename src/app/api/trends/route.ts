import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    const token = process.env.APIFY_TOKEN;
    const actorId = process.env.APIFY_VINTED_ACTOR_ID;

    if (!token || !actorId) {
      return NextResponse.json(
        {
          error:
            "Mancano APIFY_TOKEN o APIFY_VINTED_ACTOR_ID nel file .env.local",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          startUrls: [
            {
              url: `https://www.vinted.com/catalog?search_text=${encodeURIComponent(query)}`,
            },
          ],

          maxProducts: 10,
        }),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Errore Apify",
          status: response.status,
          details: text,
        },
        { status: 500 }
      );
    }

    const items = JSON.parse(text);
    console.log("APIFY RAW:", items);

    const results = items.map((item: any) => {
    const rawPrice =
    item.price?.amount ||
    item.total_item_price?.amount ||
    item.totalItemPrice?.amount ||
    item.price ||
    item.totalItemPrice ||
    item.priceWithCurrency ||
    item.currentPrice ||
    item.amount ||
    0;

      const price =
        typeof rawPrice === "number"
          ? rawPrice
          : Number(
              String(rawPrice)
                .replace(",", ".")
                .replace(/[^\d.]/g, "")
            );

      return {
        title: item.title || item.name || "Prodotto",
        price: Number.isFinite(price) ? price : 0,
        url: item.url || item.itemUrl || item.link,
        image:
        item.photo?.url ||
        item.image ||
        item.imageUrl ||
        item.thumbnail ||
        item.photos?.[0]?.url,
      };
    });

    const valid = results.filter((item: any) => item.price > 0);

    const avgPrice =
      valid.length > 0
        ? valid.reduce((sum: number, item: any) => sum + item.price, 0) /
          valid.length
        : 0;

    return NextResponse.json({
      query,
      count: valid.length,

      avgPrice: Number(avgPrice.toFixed(2)),

      minPrice: valid.length
        ? Math.min(...valid.map((i: any) => i.price))
        : 0,

      maxPrice: valid.length
        ? Math.max(...valid.map((i: any) => i.price))
        : 0,

      results: valid,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Errore interno",
        details: error.message,
      },
      { status: 500 }
    );
  }
}