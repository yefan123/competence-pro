(function init() {

    // document.body.addEventListener('keydown', event => {

    //         let outer = window.parent.parent
    //         // let i = parseInt(sessionStorage.getItem('currentTabIndex'))

    //         // if (event.key == 'ArrowLeft') {
    //         //     i = i == 0 ? outer.tabList.length - 1 : i - 1
    //         //     outer.tabList[i].click()
    //         // } else if (event.key === 'ArrowRight') {
    //         //     i = i == outer.tabList.length - 1 ? 0 : i + 1
    //         //     outer.tabList[i].click()
    //         // }


    //         let i = Number(event.key)
    //         if (i >= 0 && i < outer.tabList.length) {
    //             outer.tabList[i].click()
    //         }


    //         event.preventDefault();
    //         return false;
    // })







    document.querySelectorAll('.innerEditor').forEach(editor => {
        editor.addEventListener('click', event => {
            event.stopPropagation();
        })
    })






})();



// 所有传输数据统一于json