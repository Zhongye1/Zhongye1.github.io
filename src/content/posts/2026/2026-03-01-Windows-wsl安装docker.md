---
uuid: ede62ea0-156d-11f1-831d-452b2349953b
title: 2026-03-01-Windows wsl安装docker
mathjax: true
abbrlink: 7505
published: 2026-03-01 20:55:31
category: 工具
tags:
    - Docker
    - WSL
    - Windows
    - 安装
---

Docker是一个开源的容器平台，它允许开发者将应用程序及其依赖项打包到一个轻量级、可移植的容器中。
### 第一步：系统准备

### 1.1 检查系统环境

```bash
# 检查系统版本
lsb_release -a

# 检查内核版本
uname -r

# 检查磁盘空间
df -h

# 检查当前用户
whoami
id
```

### 1.2 更新系统

```bash
# 更新包列表
sudo apt update

# 升级系统包
sudo apt upgrade
```

### 1.3 配置iptables（WSL2）

```bash
# 更新iptables替代方案
sudo update-alternatives --set iptables /usr/sbin/iptables-legacy
sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy

# 验证iptables配置
sudo iptables --version
```

# 验证目录结构

```bash
sudo ls -la /opt/docker/
```

### 第三步：Docker仓库配置

### 3.1 清理可能存在的旧配置

```bash
# 删除可能存在的旧配置
sudo rm -f /etc/apt/sources.list.d/docker.list
sudo rm -f /usr/share/keyrings/docker-archive-keyring.gpg
sudo rm -f /usr/share/keyrings/docker.gpg

# 确保目录存在
sudo mkdir -p /usr/share/keyrings
```

### 3.2 添加Docker官方GPG密钥

```bash
# 下载Docker GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg

# 设置密钥文件权限
sudo chmod a+r /usr/share/keyrings/docker.gpg

# 验证密钥文件
ls -la /usr/share/keyrings/docker.gpg

# 验证密钥内容
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/docker.gpg --list-keys
```

### 3.3 添加Docker仓库

```bash
# 添加Docker仓库到APT源
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  trixie stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 验证仓库配置
cat /etc/apt/sources.list.d/docker.list

# 更新包列表
sudo apt update
```

### 3.4 验证Docker仓库

```bash
# 检查Docker包是否可用
apt-cache policy docker-ce

# 查看可用的Docker版本
apt-cache madison docker-ce | head -5
```

### 第四步：Docker配置（安装前配置）

### 4.1 创建Docker配置目录

```bash
# 创建Docker配置目录
sudo mkdir -p /etc/docker

# 设置配置目录权限
sudo chown root:root /etc/docker
sudo chmod 755 /etc/docker
```

### 4.2 创建daemon.json配置文件

```bash
# 创建Docker配置文件
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "data-root": "/opt/docker",
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "registry-mirrors": [
    "https://docker.1ms.run"
  ],
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 5,
  "iptables": true,
  "ip-forward": true,
  "bridge": "docker0",
  "default-address-pools": [
    {
      "base": "172.17.0.0/16",
      "size": 24
    }
  ],
  "experimental": false,
  "features": {
    "buildkit": true
  },
  "insecure-registries": []
}
EOF

# 验证配置文件
echo "Docker daemon配置:"
cat /etc/docker/daemon.json

# 验证JSON格式
jq . /etc/docker/daemon.json && echo "配置文件格式正确" || echo "配置文件格式错误"
```

### 第五步：安装Docker

### 5.1 安装Docker Engine

```bash
# 安装Docker CE及相关组件
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 验证安装
docker --version
docker compose version
```

### 5.2 验证Docker安装

```bash
# 检查Docker二进制文件
which docker
which dockerd

# 检查Docker组件
dpkg -l | grep docker
```

### 第六步：启动和配置Docker服务

### 6.1 启动Docker服务

```bash
# 启动Docker服务
sudo service docker start

# 等待服务启动
sleep 5

# 检查服务状态
sudo service docker status

# 检查Docker进程
ps aux | grep dockerd | grep -v grep
```

### 6.2 验证Docker守护进程

```bash
# 检查Docker守护进程配置
sudo docker info | head -20

# 验证数据目录配置
echo "Docker数据根目录:"
sudo docker info | grep "Docker Root Dir"

# 检查Docker socket
ls -la /var/run/docker.sock
```

### 第七步：配置普通用户免sudo使用Docker

### 7.1 创建docker用户组并添加用户

```bash
# 检查docker组是否存在
getent group docker || echo "docker组不存在，需要创建"

# 创建docker用户组（如果不存在）
sudo groupadd docker 2>/dev/null || echo "docker组已存在"

# 将当前用户添加到docker组
sudo usermod -aG docker $USER

# 验证用户组配置
echo "当前用户组信息:"
id $USER

# 显示docker组成员
echo "docker组成员:"
getent group docker
```

### 7.2 配置Docker socket权限

```bash
# 设置Docker socket权限
sudo chown root:docker /var/run/docker.sock
sudo chmod 660 /var/run/docker.sock

# 验证socket权限
echo "Docker socket权限:"
ls -la /var/run/docker.sock
```

### 7.3 应用用户组权限

```bash
# 方法1: 使用newgrp命令（当前会话生效）
echo "使用newgrp命令应用权限..."
newgrp docker

```

### 7.4 测试普通用户权限

```bash
# 测试不使用sudo的Docker命令
echo "测试普通用户Docker权限..."
docker --version
docker info | head -5

```

### 8.1 基本功能

```bash
# 运行hello-world测试（不使用sudo）
docker run hello-world

# 检查镜像是否正确存储
docker images

# 检查容器历史
docker ps -a
```

```bash
# 测试网络功能
docker network ls

# 创建测试网络
docker network create test-network

# 验证网络配置文件
sudo ls -la /opt/docker/network/

# 删除测试网络
docker network rm test-network
```

```bash
# 测试卷功能
docker volume create test-volume

# 查看卷列表
docker volume ls

# 检查卷存储位置
sudo ls -la /opt/docker/volumes/

# 删除测试卷
docker volume rm test-volume
```

```bash
# 运行一个更复杂的测试容器
docker run -d --name test-nginx -p 8080:80 nginx:alpine

# 检查容器状态
docker ps

# 测试网络连接
sleep 3
curl -I http://localhost:8080 2>/dev/null && echo "容器网络正常" || echo "网络连接失败（可能端口被占用）"

# 检查容器数据存储
sudo ls -la /opt/docker/containers/

# 查看容器日志
docker logs test-nginx

# 清理测试容器
docker stop test-nginx
docker rm test-nginx
docker rmi nginx:alpine hello-world
```

## 基本命令

```bash
# 查看状态
dstatus                    # 查看详细状态
docker ps                  # 查看运行中的容器
docker ps -a              # 查看所有容器
docker images             # 查看镜像

# 启动/停止服务
dstart                    # 启动Docker服务
dstop                     # 停止Docker服务
drestart                  # 重启Docker服务
zz
# 资源管理
dclean                    # 清理未使用的资源
dsize                     # 查看数据目录大小
dspace                    # 查看磁盘使用情况
dmaintenance              # 运行完整维护

# 容器操作
docker run -it ubuntu bash               # 交互式运行容器
docker run -d --name myapp nginx        # 后台运行容器
docker exec -it myapp bash              # 进入运行中的容器
docker logs myapp                       # 查看容器日志
docker stop myapp                       # 停止容器
docker rm myapp                         # 删除容器
```

### 数据持久化

```bash
# 使用卷持久化数据
docker volume create mydata
docker run -d -v mydata:/data nginx

# 绑定主机目录
docker run -d -v /home/user/data:/data nginx
```

### 网络配置

```bash
# 创建自定义网络
docker network create mynetwork
docker run -d --network mynetwork nginx
```
