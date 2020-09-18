export default {
    init() {
        const tj = document.createElement('div');
        tj.id = 'cnzz'
        const span = document.createElement("span");
        span.id = "cnzz_stat_icon_1278930107";
        const script = document.createElement("script");
        script.src =
            "https://v1.cnzz.com/z_stat.php?id=1278930107&online=1&show=line";
        script.type = "text/javascript";
        document.body.append(tj);
        tj.append(span);
        tj.append(script);
    }
}