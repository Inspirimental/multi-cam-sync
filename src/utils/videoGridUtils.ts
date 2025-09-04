import { VideoConfig } from '@/types/VideoTypes';

export const defaultVideoConfigs: VideoConfig[] = [
  { id: 'NCBSC_front', name: 'NCBSC_front.m3u8', title: 'Front Camera', position: 'front', src: 'https://sharing.timbeck.de/hls/NCBSC_front/index.m3u8' },
  { id: 'TCBSC_back', name: 'TCBSC_back.m3u8', title: 'Back Camera', position: 'back', src: 'https://sharing.timbeck.de/hls/TCBSC_back/index.m3u8' },
  { id: 'TCMVC_back', name: 'TCMVC_back.m3u8', title: 'Back Center', position: 'back', src: 'https://sharing.timbeck.de/hls/TCMVC_back/index.m3u8' },
  { id: 'NLBSC_left', name: 'NLBSC_left.m3u8', title: 'Left Side', position: 'side', src: 'https://sharing.timbeck.de/hls/NLBSC_left/index.m3u8' },
  { id: 'NLMVC_back_left', name: 'NLMVC_back_left.m3u8', title: 'Back Left', position: 'side', src: 'https://sharing.timbeck.de/hls/NLMVC_back_left/index.m3u8' },
  { id: 'NLMVC_front_left', name: 'NLMVC_front_left.m3u8', title: 'Front Left', position: 'side', src: 'https://sharing.timbeck.de/hls/NLMVC_front_left/index.m3u8' },
  { id: 'NRBSC_right', name: 'NRBSC_right.m3u8', title: 'Right Side', position: 'side', src: 'https://sharing.timbeck.de/hls/NRBSC_right/index.m3u8' },
  { id: 'NRMVC_back_right', name: 'NRMVC_back_right.m3u8', title: 'Back Right', position: 'side', src: 'https://sharing.timbeck.de/hls/NRMVC_back_right/index.m3u8' },
  { id: 'NRMVC_front_right', name: 'NRMVC_front_right.m3u8', title: 'Front Right', position: 'side', src: 'https://sharing.timbeck.de/hls/NRMVC_front_right/index.m3u8' },
  { id: 'WCNVC_front', name: 'WCNVC_front.m3u8', title: 'Wide Front', position: 'front', src: 'https://sharing.timbeck.de/hls/WCNVC_front/index.m3u8' },
  { id: 'WCWVC_front', name: 'WCWVC_front.m3u8', title: 'Wide Center', position: 'front', src: 'https://sharing.timbeck.de/hls/WCWVC_front/index.m3u8' },
];

export const createVideoConfigs = (videoFiles: { [key: string]: string }, cloudFrontData: any) => {
  // If CloudFront data is available, use it directly
  if (cloudFrontData?.streams && cloudFrontData.streams.length > 0) {
    return cloudFrontData.streams.map((stream: any) => ({
      id: stream.camera_position,
      name: `${stream.camera_position}.m3u8`,
      title: stream.camera_position.replace(/_/g, ' '),
      position: stream.camera_position.includes('front') ? 'front' as const : 
               stream.camera_position.includes('back') ? 'back' as const : 'side' as const,
      src: stream.hls_manifest_url
    }));
  }
  
  // Fallback: Use default configs with video files if provided
  return defaultVideoConfigs.map(config => {
    let src = config.src;
    
    // Use direct video files mapping if available
    if (videoFiles[config.id]) {
      src = videoFiles[config.id];
    }
    
    return { ...config, src };
  });
};