import { NextResponse } from 'next/server';

export async function GET() {
  const assetLinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'app.vercel.care_echo_omega.twa',
        sha256_cert_fingerprints: [
          '85:61:8B:64:62:99:BC:00:18:CC:3C:5A:6B:02:04:E6:05:10:7F:87:D6:BE:3E:3B:A7:DF:AE:31:65:A8:AF:BA',
        ],
      },
    },
  ];

  return NextResponse.json(assetLinks, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
