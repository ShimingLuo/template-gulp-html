/**
 * author: GavinLuo
 * site: https://gavinluo.cn/
 * date: 2017/12/1 15:53
 */
'use strict';

module.exports ={
    livePort: 3000,
    // 路由转发
    proxyList: [
        {
            routerPath: '/api',
            targetURL: 'http://bim.groupinno.com/api',
            other: {}
        },
        {
            routerPath: '/web',
            targetURL: 'http://bim.groupinno.com/web',
            other: {}
        },
        // {
        //     routerPath: '/web',
        //     targetURL: 'http://124.42.243.98:8089/EPCPMS/server/organization/getOrganizationTree.json',
        //     other: {}
        // }
    ],
    buildPath: 'dist',
    buildZipPath: './',
    buildZipName: 'test.zip',
    // 远程服务器链接配置
    SSH: {
        ignoreErrors: false,
        sshConfig: {
            host: '47.100.9.3',
            port: 22,
            username: 'luoshiming',
            password: 'qwertyuiop..'
        }
    },
    // 文件自动上传远程服务器绝对路径
    uploadSSHBuildPath: '/projects/GI-X04-Web-pc/ucm/',
    // shell命令，按顺序执行
    shellCommand: [
        'cd /projects/GI-X04-Web',
        'sudo git pull origin BIM-Integration'
    ]
};
