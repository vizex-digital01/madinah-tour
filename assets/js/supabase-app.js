
(function(){
  function configured(){
    return !!(
      window.MT_SUPABASE_URL &&
      window.MT_SUPABASE_KEY &&
      window.MT_SUPABASE_URL.startsWith("https://") &&
      window.MT_SUPABASE_KEY.length>20
    );
  }

  window.mtSupabaseConfigured=configured;

  window.getSupabase=function(){
    if(!configured()){
      throw new Error("Supabase belum dikonfigurasi.");
    }

    if(!window.mtSupabase){
      window.mtSupabase=window.supabase.createClient(
        window.MT_SUPABASE_URL,
        window.MT_SUPABASE_KEY,
        {
          auth:{
            persistSession:true,
            autoRefreshToken:true,
            detectSessionInUrl:true
          }
        }
      );
    }

    return window.mtSupabase;
  };

  window.mtSignIn=async function(identifier,password){
    const sb=getSupabase();

    const value=identifier.trim();
    const credentials=value.startsWith("+")
      ? {phone:value,password}
      : {email:value,password};

    const {data,error}=await sb.auth.signInWithPassword(credentials);

    if(error) throw error;

    const {data:profile,error:profileError}=await sb
      .from("profiles")
      .select("id,full_name,role,jamaah_id,is_active")
      .eq("id",data.user.id)
      .single();

    if(profileError) throw profileError;

    if(!profile?.is_active){
      await sb.auth.signOut();
      throw new Error("Akun dinonaktifkan oleh admin.");
    }

    return {user:data.user,profile};
  };

  window.mtGetSessionProfile=async function(){
    const sb=getSupabase();

    const {data:{session},error:sessionError}=await sb.auth.getSession();

    if(sessionError || !session){
      return null;
    }

    const {data:profile,error}=await sb
      .from("profiles")
      .select("id,full_name,role,jamaah_id,is_active")
      .eq("id",session.user.id)
      .single();

    if(error || !profile?.is_active){
      return null;
    }

    return {session,profile};
  };

  window.mtLogout=async function(){
    try{
      const sb=getSupabase();
      await sb.auth.signOut();
    }finally{
      window.location.replace("/");
    }
  };

  window.mtLoadJamaah=async function(){
    const sb=getSupabase();
    const auth=await mtGetSessionProfile();

    if(!auth?.profile?.jamaah_id){
      return null;
    }

    const {data,error}=await sb
      .from("jamaah")
      .select("*")
      .eq("id",auth.profile.jamaah_id)
      .single();

    if(error) throw error;
    return data;
  };

  window.mtAdminLoadJamaah=async function(){
    const sb=getSupabase();

    const {data,error}=await sb
      .from("jamaah")
      .select("*")
      .order("full_name");

    if(error) throw error;
    return data||[];
  };

  window.mtInsertLocation=async function({latitude,longitude,accuracy}){
    const sb=getSupabase();
    const auth=await mtGetSessionProfile();

    if(!auth?.profile?.jamaah_id){
      throw new Error("Akun belum terhubung ke data jamaah.");
    }

    const {error}=await sb.from("locations").insert({
      jamaah_id:auth.profile.jamaah_id,
      latitude,
      longitude,
      accuracy:accuracy||null
    });

    if(error) throw error;
    return {ok:true};
  };

  window.mtCreateSOS=async function({latitude=null,longitude=null}={}){
    const sb=getSupabase();
    const auth=await mtGetSessionProfile();

    if(!auth?.profile?.jamaah_id){
      throw new Error("Akun belum terhubung ke data jamaah.");
    }

    const {error}=await sb.from("sos_alerts").insert({
      jamaah_id:auth.profile.jamaah_id,
      latitude,
      longitude,
      status:"active"
    });

    if(error) throw error;
    return {ok:true};
  };

  window.mtLoadLatestLocations=async function(){
    const sb=getSupabase();

    const {data,error}=await sb
      .from("latest_jamaah_locations")
      .select("*");

    if(error) throw error;
    return data||[];
  };

  window.mtLoadActiveSOS=async function(){
    const sb=getSupabase();

    const {data,error}=await sb
      .from("sos_alerts")
      .select("id,jamaah_id,latitude,longitude,status,created_at,jamaah(full_name)")
      .eq("status","active")
      .order("created_at",{ascending:false});

    if(error) throw error;
    return data||[];
  };

  window.mtSubscribeCommandCenter=function(onChange){
    const sb=getSupabase();

    return sb
      .channel("madinah-command-center")
      .on("postgres_changes",{event:"*",schema:"public",table:"locations"},onChange)
      .on("postgres_changes",{event:"*",schema:"public",table:"sos_alerts"},onChange)
      .on("postgres_changes",{event:"*",schema:"public",table:"attendance"},onChange)
      .subscribe();
  };

  window.mtLoadSettings=async function(){
    const sb=getSupabase();

    const {data,error}=await sb
      .from("app_settings")
      .select("settings")
      .eq("key","global")
      .maybeSingle();

    if(error) throw error;
    return data?.settings||null;
  };

  window.mtSaveSettings=async function(settings){
    const sb=getSupabase();

    const {error}=await sb
      .from("app_settings")
      .upsert({
        key:"global",
        settings,
        updated_at:new Date().toISOString()
      },{onConflict:"key"});

    if(error) throw error;
    return {ok:true};
  };
})();
