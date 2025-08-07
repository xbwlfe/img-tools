import FreeButton from '../FreeButton';

const WhyChooseItem = ({
  title,
  desc,
  imageUrl,
  videoUrl,
  reverse,
}: {
  title: string;
  desc: string;
  imageUrl?: string;
  videoUrl: string;
  reverse: boolean;
}) => {
  return (
    <div
      className={`p-5 flex flex-col xl:flex-row ${reverse ? 'xl:flex-row-reverse' : ''} items-center gap-[40px]`}
    >
      {/* image or image + video */}
      <div className="xl:flex-shrink-0 xl:w-[640px] w-full">
        {imageUrl ? (
          <ResultSampleWithInput imageUrl={imageUrl} videoUrl={videoUrl} />
        ) : (
          <div className="w-full aspect-video overflow-hidden bg-transparent rounded-lg">
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-[40px] xl:items-start items-center">
        <h3 className="text-[24px] leading-[30px] font-bakbak">{title}</h3>
        <p className="text-[16px] text-gray-500">{desc}</p>
        <FreeButton href="#image-to-video" />
      </div>
    </div>
  );
};

// 结果样例展示，imageUrl为输入，videoUrl为输出，拼在一起展示
const ResultSampleWithInput = ({
  imageUrl,
  videoUrl,
}: {
  imageUrl: string;
  videoUrl: string;
}) => {
  return (
    <div className="relative flex flex-row w-full rounded-2xl overflow-hidden flex-shrink-0">
      <div className="w-1/2">
        <div className="bg-black/12">
          <img
            src={imageUrl}
            alt=""
            className="size-full object-cover object-top z-20"
          />
        </div>
      </div>
      <div className="w-1/2">
        <div className=" bg-black/12">
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            className="size-full object-cover object-top z-10"
          />
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[64px] h-[64px] z-30">
        <img src="/images/arrow-right.svg" width={64} height={64} />
      </div>
    </div>
  );
};

export default WhyChooseItem;
