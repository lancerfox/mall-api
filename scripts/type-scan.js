#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * TypeScript 类型问题扫描脚本
 * 生成模块级别的类型问题统计报告
 */

const MODULES = ['common', 'auth', 'user', 'menu', 'log', 'config'];
const SRC_DIR = path.join(__dirname, '../src');
const REPORTS_DIR = path.join(__dirname, '../reports');

// 确保报告目录存在
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * 扫描文件中的类型问题
 */
function scanFileForTypeIssues(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // 检查 any 类型使用
    const anyMatches = content.match(/:\s*any\b/g) || [];
    issues.push(...anyMatches.map(() => ({ type: 'explicit-any', severity: 'medium' })));
    
    // 检查 catch 块中的 any
    const catchAnyMatches = content.match(/catch\s*\(\s*\w+\s*\)/g) || [];
    issues.push(...catchAnyMatches.map(() => ({ type: 'catch-any', severity: 'low' })));
    
    // 检查缺少返回类型的导出函数
    const exportFunctionMatches = content.match(/export\s+(async\s+)?function\s+\w+\s*\([^)]*\)\s*{/g) || [];
    const exportMethodMatches = content.match(/export\s+class[\s\S]*?(?:async\s+)?\w+\s*\([^)]*\)\s*{/g) || [];
    issues.push(...exportFunctionMatches.map(() => ({ type: 'missing-return-type', severity: 'high' })));
    
    // 检查 TODO 注释中的类型相关内容
    const todoMatches = content.match(/\/\/\s*TODO.*type/gi) || [];
    issues.push(...todoMatches.map(() => ({ type: 'type-todo', severity: 'low' })));
    
    return issues;
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
    return [];
  }
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir, modulePrefix = '') {
  const results = {};
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        const subResults = scanDirectory(itemPath, modulePrefix);
        Object.assign(results, subResults);
      } else if (item.endsWith('.ts') && !item.endsWith('.spec.ts') && !item.endsWith('.d.ts')) {
        const relativePath = path.relative(SRC_DIR, itemPath);
        const issues = scanFileForTypeIssues(itemPath);
        
        if (issues.length > 0) {
          results[relativePath] = issues;
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
  
  return results;
}

/**
 * 生成模块统计
 */
function generateModuleStats(scanResults) {
  const moduleStats = {};
  
  // 初始化模块统计
  MODULES.forEach(module => {
    moduleStats[module] = {
      files: 0,
      issues: 0,
      severity: { high: 0, medium: 0, low: 0 }
    };
  });
  
  // 统计根目录文件
  moduleStats['root'] = {
    files: 0,
    issues: 0,
    severity: { high: 0, medium: 0, low: 0 }
  };
  
  // 分析扫描结果
  Object.entries(scanResults).forEach(([filePath, issues]) => {
    let module = 'root';
    
    // 确定文件所属模块
    for (const mod of MODULES) {
      if (filePath.startsWith(`modules/${mod}/`) || filePath.startsWith(`${mod}/`)) {
        module = mod;
        break;
      }
    }
    
    moduleStats[module].files++;
    moduleStats[module].issues += issues.length;
    
    // 按严重程度统计
    issues.forEach(issue => {
      moduleStats[module].severity[issue.severity]++;
    });
  });
  
  return moduleStats;
}

/**
 * 生成报告
 */
function generateReport(scanResults, moduleStats) {
  const timestamp = new Date().toISOString();
  const totalFiles = Object.keys(scanResults).length;
  const totalIssues = Object.values(scanResults).reduce((sum, issues) => sum + issues.length, 0);
  
  const report = {
    timestamp,
    summary: {
      totalFiles,
      totalIssues,
      averageIssuesPerFile: totalFiles > 0 ? (totalIssues / totalFiles).toFixed(2) : 0
    },
    moduleStats,
    fileDetails: scanResults,
    topIssueFiles: Object.entries(scanResults)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 10)
      .map(([file, issues]) => ({ file, issueCount: issues.length }))
  };
  
  return report;
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始扫描 TypeScript 类型问题...');
  
  const scanResults = scanDirectory(SRC_DIR);
  const moduleStats = generateModuleStats(scanResults);
  const report = generateReport(scanResults, moduleStats);
  
  // 保存详细报告
  const reportPath = path.join(REPORTS_DIR, 'type-scan.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // 生成简要报告
  const summaryPath = path.join(REPORTS_DIR, 'type-summary.txt');
  const summaryContent = `
TypeScript 类型问题扫描报告
生成时间: ${report.timestamp}

📊 总体统计:
- 扫描文件数: ${report.summary.totalFiles}
- 发现问题数: ${report.summary.totalIssues}
- 平均每文件问题数: ${report.summary.averageIssuesPerFile}

📁 模块统计:
${Object.entries(moduleStats)
  .filter(([, stats]) => stats.files > 0)
  .map(([module, stats]) => 
    `${module.padEnd(10)} | 文件: ${stats.files.toString().padStart(3)} | 问题: ${stats.issues.toString().padStart(3)} | 高: ${stats.severity.high} 中: ${stats.severity.medium} 低: ${stats.severity.low}`
  ).join('\n')}

🔥 问题最多的文件 (Top 10):
${report.topIssueFiles.map((item, index) => 
  `${(index + 1).toString().padStart(2)}. ${item.file} (${item.issueCount} 个问题)`
).join('\n')}

详细报告已保存到: ${reportPath}
  `.trim();
  
  fs.writeFileSync(summaryPath, summaryContent);
  
  console.log('✅ 扫描完成!');
  console.log(`📄 详细报告: ${reportPath}`);
  console.log(`📋 简要报告: ${summaryPath}`);
  console.log('\n' + summaryContent);
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, generateModuleStats, generateReport };