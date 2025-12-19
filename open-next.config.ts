// open-next.config.ts - R2 캐시 없이 배포
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig({
  // 캐시 비활성화 (R2 버킷 없이 배포)
});
