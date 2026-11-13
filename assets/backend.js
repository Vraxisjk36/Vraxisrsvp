// VraxisRSVP browser client. This publishable key is intentionally public; RLS protects data.
const {createClient}=window.supabase;
window.vraxisDB=createClient('https://ogmlfnmdhmrbbmxnxwqw.supabase.co','sb_publishable_K8hadrdvJiqCRB3eXs9tHg_0kUXl9Ry',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
window.vraxisAuth=async()=>{const {data,error}=await window.vraxisDB.auth.getUser();if(error||!data.user)return null;return data.user};
window.vraxisRequireAuth=async()=>{const user=await window.vraxisAuth();if(!user){location.href='account.html?next='+encodeURIComponent(location.pathname.split('/').pop()+location.search);return null}return user};
