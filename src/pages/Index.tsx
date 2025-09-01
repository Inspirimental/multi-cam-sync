import MultiVideoPlayer from '@/components/MultiVideoPlayer';
import { VideoStreamExample } from '@/components/VideoStreamExample';

const Index = () => {
  return (
    <>
      {/* Example Integration - AWS colleague can replace this */}
      <VideoStreamExample />
      
      {/* Original Player - for testing */}
      <MultiVideoPlayer />
    </>
  );
};

export default Index;