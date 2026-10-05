
(function(){
  const configured = () =>
    window.MT_SUPABASE_URL &&
    window.MT_SUPABASE_KEY &&
    !window.MT_SUPABASE_URL.includes("PASTE_") &&
    !window.MT_SUPABASE_KEY.includes("PASTE_");

  window.mtSupabaseConfigured = configured;

  window.getSupabase = function(){
    if(!configured()) return null;
    if(!window.mtSupabase){
      window.mtSupabase = window.supabase.createClient(
        window.MT_SUPABASE_URL,
        window.MT_SUPABASE_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );
    }
    return window.mtSupabase;
  };

  window.mtSignIn = async function(identifier,password){
    const sb=getSupabase();
    if(!sb) throw new Error("Supabase belum dikonfigurasi.");

    const value=identifier.trim();
    let credentials;

    if(value.startsWith("+")){
      credentials={phone:value,password};
    }else{
      credentials={email:value,password};
    }

    const {data,error}=await sb.auth.signInWithPassword(credentials);
    if(error) throw error;

    const user=data.user;
    const {data:profile,error:profileError}=await sb
      .from("profiles")
      .select("id,full_name,role,jamaah_id,is_active")
      .eq("id",user.id)
      .single();

    if(profileError) throw profileError;
    if(!profile?.is_active) throw new Error("Akun dinonaktifkan oleh admin.");

    return {user,profile};
  };

  window.mtGetSessionProfile = async function(){
    const sb=getSupabase();
    if(!sb) return null;

    const {data:{session}}=await sb.auth.getSession();
    if(!session) return null;

    const {data:profile,error}=await sb
      .from("profiles")
      .select("id,full_name,role,jamaah_id,is_active")
      .eq("id",session.user.id)
      .single();

    if(error || !profile?.is_active) return null;
    return {session,profile};
  };

  window.mtRequireRole = async function(roles){
    if(!configured()){
      // fallback demo mode while config is not filled
      try{
        const s=JSON.parse(localStorage.getItem("mt_session")||"null");
        if(!s || !roles.includes(s.role)){
          location.href="/";
          return null;
        }
        return {profile:{full_name:s.name,role:s.role,jamaah_id:null},demo:true};
      }catch(e){
        location.href="/";
        return null;
      }
    }

    const data=await mtGetSessionProfile();
    if(!data || !roles.includes(data.profile.role)){
      location.href="/";
      return null;
    }
    return data;
  };

  window.mtLogout = async function(){
    const sb=getSupabase();
    if(sb) await sb.auth.signOut();
    localStorage.removeItem("mt_session");
    location.href="/";
  };

  window.mtLoadJamaah = async function(){
    const sb=getSupabase();
    if(!sb) return null;
    const auth=await mtGetSessionProfile();
    if(!auth?.profile?.jamaah_id) return null;

    const {data,error}=await sb
      .from("jamaah")
      .select("*")
      .eq("id",auth.profile.jamaah_id)
      .single();

    if(error) throw error;
    return data;
  };

  window.mtAdminLoadJamaah = async function(){
    const sb=getSupabase();
    if(!sb) return [];
    const {data,error}=await sb
      .from("jamaah")
      .select("*")
      .order("full_name");
    if(error) throw error;
    return data||[];
  };

  window.mtInsertLocation = async function({latitude,longitude,accuracy}){
    const sb=getSupabase();
    if(!sb) return {demo:true};

    const auth=await mtGetSessionProfile();
    const jamaahId=auth?.profile?.jamaah_id;
    if(!jamaahId) throw new Error("Akun ini tidak terhubung ke data jamaah.");

    const {error}=await sb.from("locations").insert({
      jamaah_id:jamaahId,
      latitude,
      longitude,
      accuracy:accuracy||null
    });
    if(error) throw error;
    return {ok:true};
  };

  window.mtCreateSOS = async function({latitude=null,longitude=null}={}){
    const sb=getSupabase();
    if(!sb) return {demo:true};

    const auth=await mtGetSessionProfile();
    const jamaahId=auth?.profile?.jamaah_id;
    if(!jamaahId) throw new Error("Akun ini tidak terhubung ke data jamaah.");

    const {error}=await sb.from("sos_alerts").insert({
      jamaah_id:jamaahId,
      latitude,
      longitude,
      status:"active"
    });
    if(error) throw error;
    return {ok:true};
  };

  window.mtLoadLatestLocations = async function(){
    const sb=getSupabase();
    if(!sb) return [];

    const {data,error}=await sb
      .from("latest_jamaah_locations")
      .select("*");
    if(error) throw error;
    return data||[];
  };

  window.mtLoadActiveSOS = async function(){
    const sb=getSupabase();
    if(!sb) return [];

    const {data,error}=await sb
      .from("sos_alerts")
      .select("id,jamaah_id,latitude,longitude,status,created_at,jamaah(full_name)")
      .eq("status","active")
      .order("created_at",{ascending:false});
    if(error) throw error;
    return data||[];
  };

  window.mtSubscribeCommandCenter = function(onChange){
    const sb=getSupabase();
    if(!sb) return null;

    return sb
      .channel("madinah-command-center")
      .on("postgres_changes",{event:"*",schema:"public",table:"locations"},onChange)
      .on("postgres_changes",{event:"*",schema:"public",table:"sos_alerts"},onChange)
      .on("postgres_changes",{event:"*",schema:"public",table:"attendance"},onChange)
      .subscribe();
  };

  window.mtLoadSettings = async function(){
    const sb=getSupabase();
    if(!sb) return null;
    const {data,error}=await sb
      .from("app_settings")
      .select("settings")
      .eq("key","global")
      .maybeSingle();
    if(error) throw error;
    return data?.settings||null;
  };

  window.mtSaveSettings = async function(settings){
    const sb=getSupabase();
    if(!sb){
      localStorage.setItem("mt_admin_settings",JSON.stringify(settings));
      return {demo:true};
    }

    const {error}=await sb.from("app_settings").upsert({
      key:"global",
      settings,
      updated_at:new Date().toISOString()
    },{onConflict:"key"});
    if(error) throw error;
    return {ok:true};
  };
})();
