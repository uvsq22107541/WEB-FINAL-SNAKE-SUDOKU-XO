window.addEventListener('scroll', function(){
    let text = document.getElementById('text');
    let btn = document.getElementById('btn');
    let header = document.querySelector('head');

    let value = window.scrollY;
    text.style.marginRight = value * 4 + 'px';
    text.style.marginTop = value * 1.5 + 'px';
    btn.style.marginTop = value * 1.5 + 'px';
    header.style.top = value * 0.5 + 'px'
});