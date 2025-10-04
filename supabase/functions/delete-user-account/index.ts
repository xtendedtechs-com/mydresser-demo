import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { user_id } = await req.json();

    // Verify the user is deleting their own account
    if (user.id !== user_id) {
      throw new Error('You can only delete your own account');
    }

    console.log(`Starting account deletion for user: ${user_id}`);

    // Delete user data in order (respecting foreign key constraints)
    // Note: Some tables might have ON DELETE CASCADE, but we'll be explicit for clarity
    
    // 1. Delete social interactions
    await supabaseClient.from('post_reactions').delete().eq('user_id', user_id);
    await supabaseClient.from('post_comments').delete().eq('user_id', user_id);
    await supabaseClient.from('posts').delete().eq('user_id', user_id);
    await supabaseClient.from('follows').delete().eq('follower_id', user_id);
    await supabaseClient.from('follows').delete().eq('following_id', user_id);

    // 2. Delete marketplace data
    await supabaseClient.from('marketplace_reviews').delete().eq('reviewer_id', user_id);
    await supabaseClient.from('marketplace_reviews').delete().eq('seller_id', user_id);
    await supabaseClient.from('marketplace_transactions').delete().eq('buyer_id', user_id);
    await supabaseClient.from('marketplace_transactions').delete().eq('seller_id', user_id);
    await supabaseClient.from('market_items').delete().eq('seller_id', user_id);

    // 3. Delete messages
    await supabaseClient.from('messages').delete().eq('sender_id', user_id);
    await supabaseClient.from('messages').delete().eq('recipient_id', user_id);

    // 4. Delete wardrobe data
    await supabaseClient.from('outfit_items').delete().match({ 
      outfit_id: supabaseClient
        .from('outfits')
        .select('id')
        .eq('user_id', user_id)
    });
    await supabaseClient.from('outfits').delete().eq('user_id', user_id);
    await supabaseClient.from('item_matches').delete().eq('user_id', user_id);
    await supabaseClient.from('wardrobe_items').delete().eq('user_id', user_id);

    // 5. Delete safety/privacy data
    await supabaseClient.from('blocked_users').delete().eq('user_id', user_id);
    await supabaseClient.from('blocked_users').delete().eq('blocked_user_id', user_id);
    await supabaseClient.from('muted_users').delete().eq('user_id', user_id);
    await supabaseClient.from('muted_users').delete().eq('muted_user_id', user_id);
    await supabaseClient.from('reports').delete().eq('reporter_id', user_id);

    // 6. Delete notifications and settings
    await supabaseClient.from('notifications').delete().eq('user_id', user_id);
    await supabaseClient.from('user_settings').delete().eq('user_id', user_id);
    await supabaseClient.from('style_preferences').delete().eq('user_id', user_id);

    // 7. Delete merchant data (if applicable)
    await supabaseClient.from('merchant_items').delete().eq('merchant_id', user_id);
    await supabaseClient.from('merchant_orders').delete().eq('merchant_id', user_id);
    await supabaseClient.from('merchant_profile').delete().eq('user_id', user_id);

    // 8. Delete profile
    await supabaseClient.from('profiles').delete().eq('user_id', user_id);

    // 9. Finally, delete the auth user (this will cascade to remaining tables)
    const { error: deleteAuthError } = await supabaseClient.auth.admin.deleteUser(user_id);

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError);
      throw deleteAuthError;
    }

    console.log(`Successfully deleted account for user: ${user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account deleted successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Account deletion error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to delete account' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
