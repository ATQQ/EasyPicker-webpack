$(function() {

    autoLeftNav();
    $(window).resize(function() {
        autoLeftNav();
        console.log($(window).width())
    });

})




// 风格切换

$('.tpl-skiner-toggle').on('click', function() {
    $('.tpl-skiner').toggleClass('active');
})

$('.tpl-skiner-content-bar').find('span').on('click', function() {
    $('body').attr('class', $(this).attr('data-color'))
    saveSelectColor.Color = $(this).attr('data-color');
    // 保存选择项
    storageSave(saveSelectColor);

})




// 侧边菜单开关


function autoLeftNav() {
    if ($(window).width() < 1024) {
        $('.left-sidebar').addClass('active');
        $('.tpl-content-wrapper').addClass('active');
    } else {
        $('.left-sidebar').removeClass('active');
        $('.tpl-content-wrapper').removeClass('active');
    }
}

$('.tpl-header-switch-button').on('click', function() {
    if ($('.left-sidebar').is('.active')) {
        // if ($(window).width() > 1024) {
        //     $('.tpl-content-wrapper').removeClass('active');
        // }
        $('.tpl-content-wrapper').removeClass('active');
        $('.left-sidebar').removeClass('active');
    } else {

        $('.tpl-content-wrapper').addClass('active');
        $('.left-sidebar').addClass('active');
        // if ($(window).width() > 1024) {
        //     $('.tpl-content-wrapper').addClass('active');
        // }
    }
})
//
// // 侧边菜单
// $('.sidebar-nav-sub-title').on('click', function() {
//     $(this).siblings('.sidebar-nav-sub').slideToggle(80)
//         .end()
//         .find('.sidebar-nav-sub-ico').toggleClass('sidebar-nav-sub-ico-rotate');
// })