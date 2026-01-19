import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoAccount {
  email: string;
  password: string;
  fullName: string;
  role: 'brand' | 'creator' | 'admin';
  companyName?: string;
  channelType?: 'blogger' | 'linkedin_influencer' | 'youtuber';
}

Deno.serve(async (req) => {
  console.log('Setup demo accounts function called');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Creating Supabase admin client...');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const demoAccounts: DemoAccount[] = [
      {
        email: 'admin@partnerscale.com',
        password: 'AdminDemo123!',
        fullName: 'Admin User',
        role: 'admin'
      },
      {
        email: 'demo-brand@partnerscale.com',
        password: 'DemoBrand123!',
        fullName: 'Demo Brand User',
        role: 'brand',
        companyName: 'Demo SAAS Company'
      },
      {
        email: 'demo-creator@partnerscale.com',
        password: 'DemoCreator123!',
        fullName: 'Demo Creator User',
        role: 'creator',
        channelType: 'blogger'
      }
    ];

    const results = [];

    console.log(`Creating ${demoAccounts.length} demo accounts...`);

    for (const account of demoAccounts) {
      console.log(`Processing account: ${account.email}`);
      
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUser?.users.some(u => u.email === account.email);

      if (userExists) {
        console.log(`User ${account.email} already exists`);
        results.push({
          email: account.email,
          status: 'already_exists',
          message: 'User already exists'
        });
        continue;
      }
      
      console.log(`Creating user: ${account.email}`);

      // Create user with metadata
      const metadata: Record<string, any> = {
        full_name: account.fullName,
        role: account.role
      };

      if (account.role === 'brand' && account.companyName) {
        metadata.company_name = account.companyName;
      }

      if (account.role === 'creator' && account.channelType) {
        metadata.channel_type = account.channelType;
        metadata.platform_handle = '@demo' + account.channelType;
      }

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: metadata
      });

      if (createError) {
        console.error(`Error creating ${account.email}:`, createError);
        results.push({
          email: account.email,
          status: 'error',
          error: createError.message
        });
        continue;
      }

      console.log(`Successfully created user: ${account.email} with ID: ${newUser.user?.id}`);
      results.push({
        email: account.email,
        status: 'created',
        userId: newUser.user?.id
      });
    }

    console.log('Demo accounts setup completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo accounts setup completed',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error setting up demo accounts:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
