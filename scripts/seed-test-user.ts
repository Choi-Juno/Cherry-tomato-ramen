/**
 * Seed Test User Script
 * Creates a test user and sample transactions in Supabase
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Load environment variables
config({ path: '.env.local' });

// Fixed UUID for mock user (consistent across runs)
const MOCK_USER_UUID = '00000000-0000-0000-0000-000000000001';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Use Service Role Key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedTestUser() {
  console.log('🌱 Seeding test user and sample transactions...\n');

  try {
    // Step 1: Create test user in auth.users
    console.log('📋 Step 1: Creating/checking test user...');
    
    // Try to create the user via Supabase Auth Admin API
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        full_name: '김테스트',
      },
    });

    if (authError) {
      // Check if user already exists
      if (authError.code === 'email_exists' || authError.message.includes('already registered')) {
        console.log('✅ Test user already exists');
        
        // Get the existing user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error('❌ Failed to list users:', listError);
          throw listError;
        }
        
        const existingUser = users.find(u => u.email === 'test@example.com');
        if (!existingUser) {
          throw new Error('User exists but could not be found');
        }
        
        console.log(`   User ID: ${existingUser.id}`);
        
        // Update MOCK_USER_UUID to match the existing user
        const actualUserId = existingUser.id;
        
        // Check for existing transactions
        console.log('\n📋 Step 2: Checking for existing transactions...');
        const { data: existingTransactions } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', actualUserId);

        if (existingTransactions && existingTransactions.length > 0) {
          console.log(`⚠️  Found ${existingTransactions.length} existing transactions`);
          console.log('   Deleting old transactions...');
          
          const { error: deleteError } = await supabase
            .from('transactions')
            .delete()
            .eq('user_id', actualUserId);

          if (deleteError) {
            console.error('❌ Failed to delete old transactions:', deleteError);
          } else {
            console.log('✅ Old transactions deleted');
          }
        }

        // Use the actual user ID for transactions
        await addSampleTransactions(actualUserId);
        return;
      } else {
        console.error('❌ Failed to create user:', authError);
        throw authError;
      }
    }

    console.log('✅ Test user created!');
    console.log(`   Email: test@example.com`);
    console.log(`   Password: test123456`);
    console.log(`   User ID: ${authUser.user.id}`);

    // Create user profile in public.users table (if not exists)
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authUser.user.id,
          email: authUser.user.email!,
          full_name: '김테스트',
        },
      ]);

    if (profileError) {
      if (profileError.code === '23505') {
        // Duplicate key - profile already exists
        console.log('✅ User profile already exists');
      } else {
        console.error('❌ Failed to create user profile:', profileError);
        throw profileError;
      }
    } else {
      console.log('✅ User profile created');
    }

    // Add sample transactions
    await addSampleTransactions(authUser.user.id);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

async function addSampleTransactions(userId: string) {
  console.log('\n📋 Adding sample transactions...');
    
  const now = new Date();
  const sampleTransactions = [
    {
      user_id: userId,
      amount: 5500,
      description: '스타벅스 아메리카노',
      category: 'food',
      payment_method: 'card',
      merchant: '스타벅스',
      date: now.toISOString().split('T')[0],
    },
    {
      user_id: userId,
      amount: 12000,
      description: '택시',
      category: 'transport',
      payment_method: 'card',
      merchant: '카카오T',
      date: new Date(now.getTime() - 86400000).toISOString().split('T')[0],
    },
    {
      user_id: userId,
      amount: 9000,
      description: '점심 식사',
      category: 'food',
      payment_method: 'card',
      merchant: '한식당',
      date: new Date(now.getTime() - 86400000).toISOString().split('T')[0],
    },
    {
      user_id: userId,
      amount: 15000,
      description: '영화 관람',
      category: 'entertainment',
      payment_method: 'card',
      merchant: 'CGV',
      date: new Date(now.getTime() - 172800000).toISOString().split('T')[0],
    },
    {
      user_id: userId,
      amount: 8500,
      description: '편의점',
      category: 'food',
      payment_method: 'cash',
      merchant: 'GS25',
      date: new Date(now.getTime() - 259200000).toISOString().split('T')[0],
    },
    {
      user_id: userId,
      amount: 35000,
      description: '온라인 쇼핑',
      category: 'shopping',
      payment_method: 'card',
      merchant: '쿠팡',
      date: new Date(now.getTime() - 345600000).toISOString().split('T')[0],
    },
  ];

  const { data: transactions, error: transError } = await supabase
    .from('transactions')
    .insert(sampleTransactions)
    .select();

  if (transError) {
    console.error('❌ Failed to add transactions:', transError);
    throw transError;
  }

  console.log(`✅ Added ${transactions?.length || 0} sample transactions!`);

  // Display summary
  console.log('\n📊 Summary:');
  console.log(`   👤 User ID: ${userId}`);
  console.log('   📧 Email: test@example.com');
  console.log('   🔑 Password: test123456');
  console.log('   📝 Transactions:', transactions?.length || 0);
  console.log(`   💰 Total Amount: ${sampleTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}원`);

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Update MOCK_USER_ID in lib/store/transactions-store.tsx to:', userId);
  console.log('   2. Run "npm run dev" and test the application');
}

seedTestUser();

