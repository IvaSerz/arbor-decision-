import {signAsync} from '@electron/osx-sign';
import path from 'node:path';
if(process.platform!=='darwin')throw Error('Signing requires macOS');
await signAsync({app:path.resolve(process.argv[2]),identity:'-',identityValidation:false,preAutoEntitlements:false,optionsForFile:()=>({hardenedRuntime:false})});
