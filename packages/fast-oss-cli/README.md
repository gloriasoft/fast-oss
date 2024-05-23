####  

# fast-oss-cli
fast-oss nodejs 命令行工具  
可以在前端项目构建完毕之后，直接将静态目录整个上传到OSS  

## 安装  
```shell
# npm
npm i fast-oss-cli -g

# yarn
yarn global add fast-oss-cli
```

## 用法  
### 本地使用  
- 先创建本地OSS信息文件（只需要创建一次）  
```shell
# 输入命令后，根据提示操作
fastoss --init
```
- 然后就可以上传文件了  
```shell
# 将本地tmp/abc目录下的所有文件和子目录上传到远程bfd-test-cdn/abc目录中
fastoss -l tmp/abc -rd bfd-test-cdn/abc
```

### 在jenkins中使用
服务器构建完成后，可以直接将构建完的静态目录直接上传到远程，在jenkins中追加使用`fastoss`即可  
```shell
# 由于是服务端构建， 一般不使用本地OSS信息，而是直接指明OSS信息
fasstoss -l dist -rd bfd-test-cdn/foo-h5/dist --accessKeyId xxxxxx --accessKeySecret xxxxxxxxx
```

## 参数  
### -i, --init  
创建本地OSS信息文件  

### -rd, --remoteDir  
远程目录  

### -rf, --remoteFile
远程文件  
```shell
# 如果要指明只上传一个文件，并且要完全自定义远程的文件名，使用-rf
fastoss -l tmp/111.txt -rf bfd-test-cdn/333.txt
```

### -l, --local  
本地目录或者文件  

### -f, --force  
远程文件如果已经存在，强行覆盖  

### --accessKeyId  
在命令行直接指明accessKeyId  

### --accessKeySecret
在命令行直接指明accessKeySecret  

### --bucket  
在命令行直接指明bucket  

### --region
在命令行直接指明region  
