const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseConnection() {
  console.log('🔍 测试Supabase连接...\n');

  // 检查环境变量
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const bucketName = process.env.SUPABASE_BUCKET_NAME || 'myimage';

  console.log('📋 配置信息:');
  console.log(`   URL: ${supabaseUrl ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`   Service Key: ${supabaseServiceKey ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`   Bucket Name: ${bucketName}\n`);

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ 缺少必要的环境变量配置');
    console.log('\n请在.env文件中配置:');
    console.log('SUPABASE_URL=your-supabase-url');
    console.log('SUPABASE_SERVICE_KEY=your-service-key');
    process.exit(1);
  }

  try {
    // 创建Supabase客户端
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('🔗 正在连接Supabase...');

    // 测试1: 列出存储桶
    console.log('\n📦 测试存储桶访问...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ 获取存储桶列表失败:', bucketsError.message);
      return;
    }

    console.log('✅ 存储桶列表获取成功，共找到 ' + buckets.length + ' 个存储桶:');
    buckets.forEach(bucket => {
      const isTarget = bucket.name === bucketName;
      console.log(`   ${isTarget ? '🎯' : '📁'} ${bucket.name} ${isTarget ? '(目标桶)' : ''}`);
    });

    const targetBucket = buckets.find(bucket => bucket.name === bucketName);
    if (!targetBucket) {
      console.warn(`\n⚠️  目标存储桶 "${bucketName}" 不存在`);
      console.log('请在Supabase控制台创建该存储桶，或修改SUPABASE_BUCKET_NAME环境变量');
      return;
    }

    // 测试2: 生成预签名URL
    console.log('\n🔐 测试预签名URL生成...');
    const testFilePath = `test/test-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl(testFilePath);

    if (uploadError) {
      console.error('❌ 生成预签名URL失败:', uploadError.message);
      return;
    }

    console.log('✅ 预签名URL生成成功:');
    console.log(`   文件路径: ${testFilePath}`);
    console.log(`   上传URL: ${uploadData.signedUrl.substring(0, 80)}...`);

    // 测试3: 获取公网URL
    console.log('\n🌐 测试公网URL生成...');
    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(testFilePath);

    console.log('✅ 公网URL生成成功:');
    console.log(`   公网URL: ${publicData.publicUrl}`);

    console.log('\n🎉 Supabase集成测试完成！所有功能正常。');
    console.log('\n📝 接下来可以:');
    console.log('   1. 启动应用: npm run start:dev');
    console.log('   2. 测试图片上传API: POST /image/getUploadToken');
    console.log('   3. 检查连接状态: POST /image/health');

  } catch (error) {
    console.error('❌ Supabase连接测试失败:', error.message);
    console.log('\n🔧 可能的解决方案:');
    console.log('   1. 检查网络连接');
    console.log('   2. 验证SUPABASE_URL格式是否正确');
    console.log('   3. 确认SUPABASE_SERVICE_KEY权限是否足够');
    console.log('   4. 检查Supabase项目是否正常运行');
  }
}

// 运行测试
testSupabaseConnection();