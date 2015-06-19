//插入图片
function input_img( input_img_base64, this_img_id ){

    $('#imgManage').append("<div class='imgId"+ this_img_id +"'>\
                                <div><img src='"+ input_img_base64 +"' alt='上传图片'/></div>\
                                <input style='text' onmouseover='this.select()'></input>\
                          </div>");
    input_img_base64 = RegExp("base64,(.*)").exec(input_img_base64)[1];

    chrome.runtime.sendMessage({img_base64: input_img_base64}, function(response) {
        var _img_preview = $('.imgId'+ this_img_id);
        var _url_input = _img_preview.find('input');
        if (response.upload_status == '上传中' ){
            alert('仍有图片在上传中，请稍等...');
            _url_input.val('请重新上传');
        }else{
            _url_input.val('正在上传');
            //哎，下下策，谁有更好的办法一定要告诉我
            var get_img_id = setInterval(function(){
                chrome.runtime.sendMessage({get_img_id: 't'}, function(response) {
                    if ( response.img_id.indexOf('失败') != -1 ){
                        alert('图片上传失败，可能是未登录微博/imgur');
                        window.clearInterval( get_img_id );
                        _url_input.val('请重新上传');
                    }else if( response.img_id != '上传中' ){
                        window.clearInterval( get_img_id );
                        _url_input.val( response.img_id );
                        _img_preview.css({'background': 'rgba(246, 246, 246, 0.5)','borderColor': '#A4FF94'});
                    }
                });
            },1000);
        }
    });
}

    //————————————————初始化————————————————

    $('body').append("<div id='imgFun'><div id='imgManage' class='box'>粘贴截图或<span id='imgUploadBtn' style='cursor: pointer;'>上传图片</span><input type='file' style='display:none;' id='imgUpload' accept='image/*' /></div><div id='imgFunBtn'>&emsp;<</div></div>");
    var _imgFun = $('#imgFun');
    var _imgFunBtn = $('#imgFunBtn');

    //————————————————初始化————————————————

    //————————————————弹出/收起图片管理————————————————

    _imgFunBtn.click(function(){
        if (_imgFunBtn.text() == ' >'){
            _imgFun.css('left', '6px');
            _imgFunBtn.text(' <');
        }else{
            _imgFun.css('left', '-200px');
            _imgFunBtn.text(' >');
        }
    });

    //————————————————弹出/收起图片管理————————————————

    //————————————————粘贴图片上传————————————————

    var img_id = 1;
    //从剪切板上传
    //只要粘贴就触发，不管在什么地方粘贴
    document.body.addEventListener("paste", function(e) {
        for (var i = 0; i < e.clipboardData.items.length; ++i) {
            var this_item = e.clipboardData.items[i];
            if ( this_item.kind == "file" && /image\/\w+/.test(this_item.type) ) {
                _imgFunBtn.text() == ' >' && _imgFunBtn.click();
                var imageFile = this_item.getAsFile();

                var fileReader = new FileReader();
                fileReader.onloadend = function(e) {
                    input_img( this.result, img_id++ );
                };

                fileReader.readAsDataURL(imageFile);
                //阻止原有的粘贴事件以屏蔽文字
                e.preventDefault();
                //只黏贴一张图片
                break;
            }
        }
    });

    //————————————————粘贴图片上传————————————————

    //————————————————选择图片上传————————————————

    var _upload_img_btn = $('#imgUploadBtn');
    var _imgUpload = $('#imgUpload');
    _upload_img_btn.click(function(){
        _imgUpload.click();
    });
//遇见了不规则的冒泡事件...95%的情况下不需要此按钮，或许与隐藏的 input 位置有关
//    _imgUpload.click(function( e ){
//        e.stopPropagation()
//    });

    _imgUpload.change(function(e){
        var files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
        if (files){
            var img_file = files[0];
            //Chrome input file 支持 accepts 属性
//            if(!/image\/\w+/.test(img_file.type)){
//                alert("请上传图片文件");
//                return false;
//            }else{
                var reader = new FileReader();
                reader.onload = function(e) {
                    input_img( this.result, img_id++ );
                }
                reader.readAsDataURL(img_file);
//            }
        }else{
            alert('出错了，获取不到文件。');
        }
    });

    //————————————————选择图片上传————————————————