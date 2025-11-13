/**
 * Database Connection Test Script
 * Run with: npx tsx scripts/test-db-connection.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please check your .env.local file:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  // Non-null assertion is safe here because we already checked above
  const supabase = createClient(supabaseUrl!, supabaseKey!);
  
  try {
    // Test 1: Fetch categories
    console.log('📊 Test 1: Fetching categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (categoriesError) {
      throw categoriesError;
    }
    
    console.log(`✅ Success! Found ${categories?.length || 0} categories:`);
    categories?.forEach((cat: any) => {
      console.log(`   ${cat.icon} ${cat.label_ko} (${cat.name})`);
    });
    
    // Test 2: Check tables exist
    console.log('\n📋 Test 2: Checking table structure...');
    const tables = ['users', 'transactions', 'budgets', 'ai_insights', 'challenges'];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(0);
      
      if (error) {
        console.log(`   ❌ Table '${table}' - Error: ${error.message}`);
      } else {
        console.log(`   ✅ Table '${table}' exists`);
      }
    }
    
    console.log('\n🎉 All tests passed! Database is properly configured.');
    console.log('\n💡 Next steps:');
    console.log('   1. Create a test user in Supabase Dashboard');
    console.log('   2. Add transactions via the UI');
    console.log('   3. View data in the dashboard\n');
    
  } catch (error: any) {
    console.error('\n❌ Connection test failed:');
    console.error(error.message || error);
    console.error('\nPlease check:');
    console.error('1. Supabase project is running');
    console.error('2. Environment variables are correct');
    console.error('3. Database migrations were executed');
    process.exit(1);
  }
}

testConnection();

