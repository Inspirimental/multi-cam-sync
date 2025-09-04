import { VideoStream, CloudFrontApiResponse } from '@/types/VideoTypes';

export const mockVideoStreams: VideoStream[] = [
  {
    id: 'stream_1',
    name: '2024-01-15 Vormittag',
    date: '2024-01-15T08:00:00Z',
    status: 'pending',
    videoFiles: {
      'NCBSC_front': 'https://sharing.timbeck.de/hls/NCBSC_front/index.m3u8',
      'TCBSC_back': 'https://sharing.timbeck.de/hls/TCBSC_back/index.m3u8',
      'TCMVC_back': 'https://sharing.timbeck.de/hls/TCMVC_back/index.m3u8',
      'NLBSC_left': 'https://sharing.timbeck.de/hls/NLBSC_left/index.m3u8',
      'NLMVC_back_left': 'https://sharing.timbeck.de/hls/NLMVC_back_left/index.m3u8',
      'NLMVC_front_left': 'https://sharing.timbeck.de/hls/NLMVC_front_left/index.m3u8',
      'NRBSC_right': 'https://sharing.timbeck.de/hls/NRBSC_right/index.m3u8',
      'NRMVC_back_right': 'https://sharing.timbeck.de/hls/NRMVC_back_right/index.m3u8',
      'NRMVC_front_right': 'https://sharing.timbeck.de/hls/NRMVC_front_right/index.m3u8',
      'WCNVC_front': 'https://sharing.timbeck.de/hls/WCNVC_front/index.m3u8',
      'WCWVC_front': 'https://sharing.timbeck.de/hls/WCWVC_front/index.m3u8',
    }
  },
  {
    id: 'stream_2',
    name: '2024-01-15 Nachmittag',
    date: '2024-01-15T14:00:00Z',
    status: 'approved',
    videoFiles: {
      'NCBSC_front': 'https://sharing.timbeck.de/hls/NCBSC_front/index.m3u8',
      'TCBSC_back': 'https://sharing.timbeck.de/hls/TCBSC_back/index.m3u8',
      'TCMVC_back': 'https://sharing.timbeck.de/hls/TCMVC_back/index.m3u8',
      'NLBSC_left': 'https://sharing.timbeck.de/hls/NLBSC_left/index.m3u8',
      'NLMVC_back_left': 'https://sharing.timbeck.de/hls/NLMVC_back_left/index.m3u8',
      'NLMVC_front_left': 'https://sharing.timbeck.de/hls/NLMVC_front_left/index.m3u8',
      'NRBSC_right': 'https://sharing.timbeck.de/hls/NRBSC_right/index.m3u8',
      'NRMVC_back_right': 'https://sharing.timbeck.de/hls/NRMVC_back_right/index.m3u8',
      'NRMVC_front_right': 'https://sharing.timbeck.de/hls/NRMVC_front_right/index.m3u8',
      'WCNVC_front': 'https://sharing.timbeck.de/hls/WCNVC_front/index.m3u8',
      'WCWVC_front': 'https://sharing.timbeck.de/hls/WCWVC_front/index.m3u8',
    }
  },
  {
    id: 'stream_3',
    name: '2024-01-16 Morgen',
    date: '2024-01-16T09:00:00Z',
    status: 'rejected',
    videoFiles: {
      'NCBSC_front': 'https://sharing.timbeck.de/hls/NCBSC_front/index.m3u8',
      'TCBSC_back': 'https://sharing.timbeck.de/hls/TCBSC_back/index.m3u8',
      'NLBSC_left': 'https://sharing.timbeck.de/hls/NLBSC_left/index.m3u8',
      'NRBSC_right': 'https://sharing.timbeck.de/hls/NRBSC_right/index.m3u8',
      'WCNVC_front': 'https://sharing.timbeck.de/hls/WCNVC_front/index.m3u8',
      'WCWVC_front': 'https://sharing.timbeck.de/hls/WCWVC_front/index.m3u8',
      'TCMVC_back': 'https://sharing.timbeck.de/hls/TCMVC_back/index.m3u8',
    }
  }
];

export const createMockCloudFrontResponse = (streamName: string): CloudFrontApiResponse => ({
  cohort_id: "INC#ZRH_LCR_10024#1752756048000000000",
  vehicle_id: "ZRH_LCR_10024",
  original_session_id: "",
  streams: [
    {
      camera_position: "BCBSC_back",
      unique_session_id: "1752756048000000000_camera",
      hls_manifest_url: "https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_camera/1752756048000000000_camera_BCBSC_back/1752756048000000000_camera_BCBSC_back_master.m3u8",
      mp4_url: null,
      thumbnail_url: null,
      duration: null,
      resolution: "Auto"
    },
    {
      camera_position: "BCMVC_back",
      unique_session_id: "1752756048000000000_camera",
      hls_manifest_url: "https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_camera/1752756048000000000_camera_BCMVC_back/1752756048000000000_camera_BCMVC_back_master.m3u8",
      mp4_url: null,
      thumbnail_url: null,
      duration: null,
      resolution: "Auto"
    },
    {
      camera_position: "FLBSC_down",
      unique_session_id: "1752756048000000000_camera",
      hls_manifest_url: "https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_camera/1752756048000000000_camera_FLBSC_down/1752756048000000000_camera_FLBSC_down_master.m3u8",
      mp4_url: null,
      thumbnail_url: null,
      duration: null,
      resolution: "Auto"
    },
    {
      camera_position: "FLMVC_back_left",
      unique_session_id: "1752756048000000000_camera",
      hls_manifest_url: "https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_camera/1752756048000000000_camera_FLMVC_back_left/1752756048000000000_camera_FLMVC_back_left_master.m3u8",
      mp4_url: null,
      thumbnail_url: null,
      duration: null,
      resolution: "Auto"
    },
    {
      camera_position: "FLNVC_front",
      unique_session_id: "1752756048000000000_camera",
      hls_manifest_url: "https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_camera/1752756048000000000_camera_FLNVC_front/1752756048000000000_camera_FLNVC_front_master.m3u8",
      mp4_url: null,
      thumbnail_url: null,
      duration: null,
      resolution: "Auto"
    },
    {
      camera_position: "FLOBC_front",
      unique_session_id: "1752756048000000000_camera",
      hls_manifest_url: "https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_camera/1752756048000000000_camera_FLOBC_front/1752756048000000000_camera_FLOBC_front_master.m3u8",
      mp4_url: null,
      thumbnail_url: null,
      duration: null,
      resolution: "Auto"
    },
    {
      camera_position: "FRBSC_down",
      unique_session_id: "1752756048000000000_camera",
      hls_manifest_url: "https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_camera/1752756048000000000_camera_FRBSC_down/1752756048000000000_camera_FRBSC_down_master.m3u8",
      mp4_url: null,
      thumbnail_url: null,
      duration: null,
      resolution: "Auto"
    },
    {
      camera_position: "FRMVC_back_right",
      unique_session_id: "1752756048000000000_camera",
      hls_manifest_url: "https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_camera/1752756048000000000_camera_FRMVC_back_right/1752756048000000000_camera_FRMVC_back_right_master.m3u8",
      mp4_url: null,
      thumbnail_url: null,
      duration: null,
      resolution: "Auto"
    },
    {
      camera_position: "NCMVC_front",
      unique_session_id: "1752756048000000000_camera",
      hls_manifest_url: "https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_camera/1752756048000000000_camera_NCMVC_front/1752756048000000000_camera_NCMVC_front_master.m3u8",
      mp4_url: null,
      thumbnail_url: null,
      duration: null,
      resolution: "Auto"
    }
  ],
  total_streams: 9,
  processing_status: "completed",
  signed_cookies: {},
  expires_at: 1756973730
});