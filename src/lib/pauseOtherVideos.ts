// يوقف أي فيديو تاني شغال بالصفحة لما فيديو جديد يبدأ التشغيل
export const pauseOtherVideos = (current: HTMLVideoElement) => {
  document.querySelectorAll("video").forEach((v) => {
    if (v !== current) v.pause();
  });
};
