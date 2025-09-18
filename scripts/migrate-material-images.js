const { MongoClient } = require('mongodb');

async function migrateMaterialImages() {
  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/mall_db';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // 获取所有 material_images 数据
    const materialImages = await db
      .collection('material_images')
      .find({ status: 'active' })
      .toArray();

    console.log(`Found ${materialImages.length} material images to migrate`);

    // 转换并插入到 images 集合
    const imageDocuments = materialImages.map((img) => ({
      imageId: img.imageId,
      businessId: img.materialId,
      businessType: 'material',
      fileName: img.fileName,
      filePath: img.filePath,
      fileSize: img.fileSize,
      mimeType: img.mimeType,
      width: img.width,
      height: img.height,
      sortOrder: img.sortOrder,
      isMain: img.isMain,
      thumbnailPath: img.thumbnailPath,
      mediumPath: img.mediumPath,
      description: null,
      alt: null,
      status: img.status,
      createdAt: img.createdAt,
      updatedAt: img.updatedAt,
      createdBy: img.createdBy,
    }));

    if (imageDocuments.length > 0) {
      // 检查是否已经存在迁移的数据，避免重复迁移
      const existingCount = await db
        .collection('images')
        .countDocuments({ businessType: 'material' });

      if (existingCount === 0) {
        await db.collection('images').insertMany(imageDocuments);
        console.log(`Successfully migrated ${imageDocuments.length} images`);
      } else {
        console.log(
          `Found ${existingCount} existing material images in images collection, skipping migration`,
        );
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateMaterialImages()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateMaterialImages };
