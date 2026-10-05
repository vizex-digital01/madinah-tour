
(function(){
  window.getSupabase=function(){
    if(!window.mtSupabase){
      window.mtSupabase=window.supabase.createClient(
        window.MT_SUPABASE_URL,
        window.MT_SUPABASE_KEY
      );
    }
    return window.mtSupabase;
  };

  window.mtSignIn=async function(identifier,password){
    const sb=getSupabase();

    const {data,error}=await sb.auth.signInWithPassword({
      email:identifier.trim(),
      password
    });
    if(error) throw error;

    const {data:profile,error:profileError}=await sb
      .from("profiles")
      .select("id,full_name,role,jamaah_id,is_active")
      .eq("id",data.user.id)
      .single();

    if(profileError) throw profileError;
    if(!profile?.is_active) throw new Error("Akun dinonaktifkan oleh admin.");

    return {user:data.user,profile};
  };

  window.mtLogout=async function(){
    const sb=getSupabase();
    await sb.auth.signOut();
    location.href="/";
  };
})();
