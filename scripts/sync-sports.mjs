import 'dotenv/config';
import {createClient} from '@supabase/supabase-js';
import {syncSports} from '../server/sports.mjs';
if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('Faltan credenciales de Supabase');
const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
console.log(JSON.stringify(await syncSports(db),null,2));
