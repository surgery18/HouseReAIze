				import worker, * as OTHER_EXPORTS from "C:\\Users\\surge\\Desktop\\projects\\HouseReAIze\\src\\node_modules\\wrangler\\templates\\pages-template-worker.ts";
				import * as __MIDDLEWARE_0__ from "C:\\Users\\surge\\Desktop\\projects\\HouseReAIze\\src\\node_modules\\wrangler\\templates\\middleware\\middleware-ensure-req-body-drained.ts";
import * as __MIDDLEWARE_1__ from "C:\\Users\\surge\\Desktop\\projects\\HouseReAIze\\src\\node_modules\\wrangler\\templates\\middleware\\middleware-miniflare3-json-error.ts";
				
				worker.middleware = [
					__MIDDLEWARE_0__.default,__MIDDLEWARE_1__.default,
					...(worker.middleware ?? []),
				].filter(Boolean);
				
				export * from "C:\\Users\\surge\\Desktop\\projects\\HouseReAIze\\src\\node_modules\\wrangler\\templates\\pages-template-worker.ts";
				export default worker;