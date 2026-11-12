import {sign} from '@electron/osx-sign';
import path from 'node:path';
if(process.platform!=='darwin')throw Error('Signing requires macOS');
await sign({app:path.resolve(process.argv[2]),identity:'-',identityValidation:false,preAutoEntitlements:false,optionsForFile:()=>({hardenedRuntime:false,entitlements:['com.apple.security.cs.allow-jit']})});
