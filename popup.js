// onLoad
window.addEventListener('load', function(evt) {
	$.event.props.push( "dataTransfer" );
	chrome.tabs.getSelected(null, function(tab) {
		var tabUrl = tab.url;
		var ssgDomain = ".ssg.com";
		if(tab.url.indexOf(ssgDomain) == -1) {
			//chrome.tabs.create({ url: 'http://www.ssg.com' })
		};
	});
	
	// 로컬스토리지
	var ls = localStorage;
	
	var itemId = ls.getItem("itemId");
	if(itemId != null) {
		$('#item_id').val(itemId);
	}
	
	chrome.runtime.getBackgroundPage(function(eventPage) {
		eventPage.setDragEvent();
	});
	
	$('#item_id').attr("droppable",true).on("drop",function(e){
		e.preventDefault();
		$('#item_id').val(e.dataTransfer.getData("text"));
	});
	
});

// 상품ID 입력시
document.getElementById('item_id').onkeyup = function(e) {
	if(e.keyCode == '13') {
		createPromotion();
	}
};

// 확인버튼 클릭시
document.getElementById('confirmBtn').addEventListener('click', function(evt){
	createPromotion();
});

$('#promotion').change(function(data){
	var prvdDiv = $('#prvdDiv');
	var prvdMthdDiv = $('#prvdMthdDiv');
	
	isPrvdShow() == true ? prvdDiv.show() : prvdDiv.hide();
	isPrvdMthdShow() == true ? prvdMthdDiv.show() : prvdMthdDiv.hide();
});

function isPrvdShow(){
	var prvdShowArr = ["에누리", "쿠폰", "S머니", "S포인트", "카드선할인"];
	var prvdPrftTypeCd = $('input[name=prvdPrftTypeCd]:checked').val();	
	var prom = $('#promotion>option:selected').val();
	var prvdShowFlag = false;
	
	for(var i=0; i<prvdShowArr.length; i++) {
		if(prom == prvdShowArr[i]){
			prvdShowFlag = true;
		}
	};
	
	return prvdShowFlag;
}

function isPrvdMthdShow(){
	var prvdMthdShowArr = ["S머니","S포인트"];
	var prvdMthdCd = $('input[name=prvdMthdCd]:checked').val();	
	var prom = $('#promotion>option:selected').val();
	var prvdMthdFlag = false;

	for(var i=0; i<prvdMthdShowArr.length; i++) {
		if(prom == prvdMthdShowArr[i]){
			prvdMthdFlag = true;
		}
	};
	
	return prvdMthdFlag;
}
function createPromotion(){
	var itemId = $('#item_id').val();
	var env = $('input[name=env]:checked').val();
	var promotion;
	
	$('#promotion>option:selected').each(function() {
		  promotion = $(this).val();
	});
	
	if(itemId == '') alert('상품ID를 입력하세요.');

	var param = {"itemId":itemId, "offerType":promotion};
	isPrvdShow() == true ? param.prvdPrftTypeCd = $('input[name=prvdPrftTypeCd]:checked').val() : '';
	isPrvdMthdShow() == true ? param.prvdMthdCd = $('input[name=prvdMthdCd]:checked').val() : '';
	
	var targetUrl = 'http://' + env + '-m.apps.ssg.com/api/dponly/prom.ssg';
	
	$.ajax({
		type: 'POST',
		data: JSON.stringify(param),
		dataType: 'json',
		processData: false,
		contentType : "application/json", 
		url: targetUrl,
		success: function(result) {
			var title = "프로모션 추가\n";
			var message = "상품ID : " + itemId + "\n프로모션 : " + promotion;
			console.log(result);
			chrome.notifications.create("add_promotion_execute",
				{
					type: "basic",
					iconUrl: "sale128.png",
					title: title,
					message: message
				}, function(noti){
					console.log("상품ID : " + itemId + "\n프로모션 : " + promotion);
					$('#result_prom').html(JSON.stringify(result));
					$('#result_message').show();
			});
			
		},error: function(err) {
			var title = "프로모션 생성 실패\n";
			var message = "프로모션 생성 실패";
			chrome.notifications.create("add_promotion_fail",
				{
					type: "basic",
					iconUrl: "sale128.png",
					title: title,
					message: message
				}, function(noti){
					console.log("프로모션 생성 실패\n" + err.status);
					$('#result_message').html("프로모션 생성 실패 [" + err.status + "]").show();
			});
		}
	});
}
// 팝업 unfocus
window.addEventListener("unload", function (event) {
	var ls = localStorage;
	
	// 상품Id
	ls.setItem("itemId", $('#item_id').val());
});

