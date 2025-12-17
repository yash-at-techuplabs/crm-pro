import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   - VITE_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedTestUser() {
  console.log('🌱 Seeding test user...')

  try {
    // Create test user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'yashdayani0@gmail.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User'
      }
    })

    if (userError) {
      if (userError.message.includes('already been registered')) {
        console.log('ℹ️  Test user already exists')
      } else {
        throw userError
      }
    } else {
      console.log('✅ Test user created:', userData.user?.email)
    }

    // Create some sample data
    const userId = userData?.user?.id

    if (userId) {
      // Sample companies
      const companies = [
        { name: 'Acme Corporation', industry: 'Technology', size: '51-200', website: 'https://acme.com', owner_id: userId, created_by: userId },
        { name: 'Global Tech Solutions', industry: 'Technology', size: '201-500', website: 'https://globaltech.com', owner_id: userId, created_by: userId },
        { name: 'Healthcare Plus', industry: 'Healthcare', size: '1000+', website: 'https://healthcareplus.com', owner_id: userId, created_by: userId },
      ]

      const { data: companyData } = await supabase.from('companies').insert(companies).select()
      console.log('✅ Sample companies created:', companyData?.length)

      // Sample contacts
      if (companyData && companyData.length > 0) {
        const contacts = [
          { first_name: 'John', last_name: 'Smith', email: 'john.smith@acme.com', job_title: 'CEO', company_id: companyData[0].id, owner_id: userId, created_by: userId },
          { first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.j@globaltech.com', job_title: 'CTO', company_id: companyData[1].id, owner_id: userId, created_by: userId },
          { first_name: 'Michael', last_name: 'Brown', email: 'michael.b@healthcareplus.com', job_title: 'VP Sales', company_id: companyData[2].id, owner_id: userId, created_by: userId },
        ]

        const { data: contactData } = await supabase.from('contacts').insert(contacts).select()
        console.log('✅ Sample contacts created:', contactData?.length)

        // Get default pipeline stages
        const { data: stages } = await supabase.from('pipeline_stages').select('*').order('position')
        
        if (stages && stages.length > 0 && contactData) {
          // Sample deals
          const deals = [
            { name: 'Enterprise License Deal', value: 50000, stage_id: stages[1].id, contact_id: contactData[0].id, company_id: companyData[0].id, expected_close_date: '2025-02-15', pipeline_id: '00000000-0000-0000-0000-000000000001', owner_id: userId, created_by: userId },
            { name: 'Annual Subscription', value: 25000, stage_id: stages[2].id, contact_id: contactData[1].id, company_id: companyData[1].id, expected_close_date: '2025-01-30', pipeline_id: '00000000-0000-0000-0000-000000000001', owner_id: userId, created_by: userId },
            { name: 'Healthcare Platform Integration', value: 100000, stage_id: stages[0].id, contact_id: contactData[2].id, company_id: companyData[2].id, expected_close_date: '2025-03-01', pipeline_id: '00000000-0000-0000-0000-000000000001', owner_id: userId, created_by: userId },
          ]

          const { data: dealData } = await supabase.from('deals').insert(deals).select()
          console.log('✅ Sample deals created:', dealData?.length)
        }
      }

      // Sample leads
      const leads = [
        { first_name: 'Emily', last_name: 'Davis', email: 'emily.davis@startup.io', company_name: 'Startup.io', lead_source: 'Website', score: 75, status: 'qualified', owner_id: userId, created_by: userId },
        { first_name: 'David', last_name: 'Wilson', email: 'david.w@enterprise.com', company_name: 'Enterprise Inc', lead_source: 'Referral', score: 90, status: 'new', owner_id: userId, created_by: userId },
      ]

      const { data: leadData } = await supabase.from('leads').insert(leads).select()
      console.log('✅ Sample leads created:', leadData?.length)

      // Sample tasks
      const tasks = [
        { title: 'Follow up with Acme CEO', description: 'Schedule a demo call', priority: 'high', due_date: new Date(Date.now() + 86400000).toISOString(), assigned_to: userId, created_by: userId },
        { title: 'Prepare proposal for Global Tech', priority: 'urgent', due_date: new Date(Date.now() + 172800000).toISOString(), assigned_to: userId, created_by: userId },
        { title: 'Review quarterly targets', priority: 'medium', due_date: new Date(Date.now() + 604800000).toISOString(), assigned_to: userId, created_by: userId },
      ]

      const { data: taskData } = await supabase.from('tasks').insert(tasks).select()
      console.log('✅ Sample tasks created:', taskData?.length)
    }

    console.log('\n🎉 Seeding complete!')
    console.log('\n📧 Test Credentials:')
    console.log('   Email: yashdayani0@gmail.com')
    console.log('   Password: password123')

  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

seedTestUser()

