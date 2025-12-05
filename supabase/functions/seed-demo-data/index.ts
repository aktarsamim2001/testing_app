import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Get demo user IDs
    const { data: brandUser } = await supabaseAdmin.auth.admin.listUsers();
    const demoBrand = brandUser?.users.find(u => u.email === 'demo-brand@partnerscale.com');
    const demoCreator = brandUser?.users.find(u => u.email === 'demo-creator@partnerscale.com');

    if (!demoBrand || !demoCreator) {
      throw new Error('Demo users not found');
    }

    // Get client and partner records
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('created_by', demoBrand.id)
      .single();

    const { data: demoPartner } = await supabaseAdmin
      .from('partners')
      .select('id')
      .eq('created_by', demoCreator.id)
      .single();

    if (!client || !demoPartner) {
      throw new Error('Client or partner record not found');
    }

    // Create additional demo partners
    const { data: additionalPartners } = await supabaseAdmin
      .from('partners')
      .insert([
        {
          name: 'Tech Blog Express',
          email: 'contact@techblogexpress.com',
          channel_type: 'blogger',
          platform_handle: '@techblogexpress',
          follower_count: 45000,
          engagement_rate: 3.8,
          category: ['technology', 'saas', 'productivity'],
          created_by: demoBrand.id
        },
        {
          name: 'Sarah Martinez',
          email: 'sarah@linkedinpro.com',
          channel_type: 'linkedin',
          platform_handle: 'sarah-martinez-tech',
          follower_count: 125000,
          engagement_rate: 5.2,
          category: ['business', 'leadership', 'saas'],
          created_by: demoBrand.id
        },
        {
          name: 'DevTube Channel',
          email: 'contact@devtube.com',
          channel_type: 'youtube',
          platform_handle: '@DevTubeOfficial',
          follower_count: 250000,
          engagement_rate: 4.5,
          category: ['technology', 'tutorials', 'software'],
          created_by: demoBrand.id
        }
      ])
      .select();

    // Create demo campaigns
    const { data: campaigns } = await supabaseAdmin
      .from('campaigns')
      .insert([
        {
          name: 'Q1 Product Launch Campaign',
          client_id: client.id,
          type: 'blogger_outreach',
          status: 'active',
          budget: 15000,
          start_date: '2025-01-15',
          end_date: '2025-03-31',
          description: 'Major product launch targeting tech bloggers with comprehensive review content and feature highlights.',
          created_by: demoBrand.id
        },
        {
          name: 'LinkedIn Thought Leadership Series',
          client_id: client.id,
          type: 'linkedin_influencer',
          status: 'active',
          budget: 20000,
          start_date: '2025-02-01',
          end_date: '2025-04-30',
          description: 'Building brand authority through LinkedIn influencer partnerships focused on B2B SaaS insights.',
          created_by: demoBrand.id
        },
        {
          name: 'YouTube Tutorial Integration',
          client_id: client.id,
          type: 'youtube_campaign',
          status: 'planning',
          budget: 25000,
          start_date: '2025-03-01',
          end_date: '2025-05-31',
          description: 'Sponsored tutorial videos demonstrating product use cases and integration capabilities.',
          created_by: demoBrand.id
        },
        {
          name: 'Holiday Promotion Wave',
          client_id: client.id,
          type: 'blogger_outreach',
          status: 'completed',
          budget: 12000,
          start_date: '2024-11-01',
          end_date: '2024-12-31',
          description: 'End-of-year promotional campaign across multiple blogger channels.',
          created_by: demoBrand.id
        }
      ])
      .select();

    if (!campaigns || campaigns.length === 0) {
      throw new Error('Failed to create campaigns');
    }

    // Assign partners to campaigns
    const assignments = [];

    // Assign demo creator to first two active campaigns
    assignments.push({
      campaign_id: campaigns[0].id,
      partner_id: demoPartner.id,
      status: 'active',
      compensation: 2500,
      notes: 'Primary content creator for product review series'
    });

    assignments.push({
      campaign_id: campaigns[1].id,
      partner_id: demoPartner.id,
      status: 'active',
      compensation: 3000,
      notes: 'LinkedIn post series and engagement'
    });

    // Assign additional partners to campaigns
    if (additionalPartners && additionalPartners.length > 0) {
      // Tech Blog Express to Q1 Launch and completed campaign
      assignments.push({
        campaign_id: campaigns[0].id,
        partner_id: additionalPartners[0].id,
        status: 'active',
        compensation: 2000,
        notes: 'Technical deep-dive blog post'
      });

      assignments.push({
        campaign_id: campaigns[3].id,
        partner_id: additionalPartners[0].id,
        status: 'completed',
        compensation: 1800,
        notes: 'Holiday promotion blog coverage'
      });

      // Sarah Martinez to LinkedIn campaign
      assignments.push({
        campaign_id: campaigns[1].id,
        partner_id: additionalPartners[1].id,
        status: 'active',
        compensation: 5000,
        notes: 'Executive thought leadership content'
      });

      // DevTube to YouTube campaign
      assignments.push({
        campaign_id: campaigns[2].id,
        partner_id: additionalPartners[2].id,
        status: 'pending',
        compensation: 8000,
        notes: 'Tutorial video series production'
      });
    }

    await supabaseAdmin
      .from('campaign_partners')
      .insert(assignments);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo data seeded successfully',
        data: {
          campaigns: campaigns.length,
          partners: (additionalPartners?.length || 0) + 1,
          assignments: assignments.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding demo data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
