export async function getUserRating(handle: string) {
  const res = await fetch(
    `https://codeforces.com/api/user.rating?handle=${handle}`,
    { next: { revalidate: 300 } },
  );

  const data = await res.json();

  if (data.status !== "OK") {
    throw new Error("Codeforces API error");
  }

  return data.result;
}
