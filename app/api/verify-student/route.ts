export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ic = searchParams.get('ic');

  if (!ic) {
    return Response.json({ error: 'IC number is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://campusonline2.usm.my/photo/StudentPic/${ic}.jpg`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return Response.json({ error: 'Failed to verify student' }, { status: 500 });
  }
}
