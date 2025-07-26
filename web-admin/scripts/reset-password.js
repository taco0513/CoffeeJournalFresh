// 비밀번호 재설정 스크립트
// 사용법: node scripts/reset-password.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL 또는 Service Role Key가 설정되지 않았습니다.');
  console.error('💡 .env.local 파일에 SUPABASE_SERVICE_ROLE_KEY를 추가해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword() {
  const email = 'hello@zimojin.com';
  
  // 비밀번호 재설정 링크 전송
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: email,
  });

  if (error) {
    console.error('❌ 에러:', error.message);
    return;
  }

  console.log('✅ 비밀번호 재설정 링크가 생성되었습니다:');
  console.log(data.properties.action_link);
  console.log('\n이 링크를 브라우저에서 열어 비밀번호를 재설정하세요.');
}

// 대안: 직접 비밀번호 업데이트 (Service Role Key 필요)
async function updatePasswordDirectly() {
  const email = 'hello@zimojin.com';
  const newPassword = 'your-new-password-here'; // 원하는 비밀번호로 변경
  
  const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(email);
  
  if (userError) {
    console.error('❌ 사용자 조회 실패:', userError.message);
    return;
  }

  if (!user) {
    console.log('❌ 사용자를 찾을 수 없습니다. 새로 생성합니다...');
    
    // 사용자 생성
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: newPassword,
      email_confirm: true
    });

    if (createError) {
      console.error('❌ 사용자 생성 실패:', createError.message);
      return;
    }

    console.log('✅ 사용자가 생성되었습니다!');
    console.log('이메일:', email);
    console.log('비밀번호:', newPassword);
    return;
  }

  // 기존 사용자 비밀번호 업데이트
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (error) {
    console.error('❌ 비밀번호 업데이트 실패:', error.message);
    return;
  }

  console.log('✅ 비밀번호가 성공적으로 업데이트되었습니다!');
  console.log('이메일:', email);
  console.log('새 비밀번호:', newPassword);
}

// 원하는 방법 선택:
// resetPassword(); // 재설정 링크 생성
updatePasswordDirectly(); // 직접 비밀번호 설정