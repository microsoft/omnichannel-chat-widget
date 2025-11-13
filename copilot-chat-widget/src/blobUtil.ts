// export async function getImageBlob(imgUrl: string): Promise<Blob> {
//   const response = await fetch(imgUrl);
//   if (!response.ok) throw new Error('Failed to fetch image');
//   const blob = await response.blob();
//   return blob;
// }


export const getBlobUrl =  async (fileMetadata: any) => {
  let url = "http://localhost:5173/ersuo-Mocha-climbs-up-high.jpg";
  if ((fileMetadata.name as string).includes("pdf")) {
    url = "http://localhost:5173/pdf.pdf"
  }
  let result = await fetch(url);
  let blob = await result.blob();
  let localBlobUrl = URL.createObjectURL(blob);
  console.log("debugging: localBloburl: ", localBlobUrl);
  return localBlobUrl;
}
