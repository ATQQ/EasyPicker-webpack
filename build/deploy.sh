# /bin/bash
compressDir="./dist"               # 压缩目录 
compressFile="result.tar.gz"        # 压缩后的文件名
user="root"                         # 远程登录用户
origin="sugarat.top"                   # 远程登录origin
targetDir="/www/wwwroot/ep.sugarat.top"     # 目标目录
echo "开始-----归档解压"
tar -zvcf ${compressFile} ${compressDir}
echo "开始-----拷贝至服务器"
scp ${compressFile} ${user}@${origin}:./
echo "开始-----部署"
ssh -p22 ${user}@${origin} "tar -xf ${compressFile} && rm -rf ${targetDir}/dist/* && mv dist/* ${targetDir}/dist && rm -rf ${compressFile}"
echo "清理-----临时的文件"
rm -rf $compressDir
rm -rf $compressFile