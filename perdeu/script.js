document.addEventListener('DOMContentLoaded', function() {
    // Elemento do DOM
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Adicionar evento de clique ao botão de checkout
    checkoutBtn.addEventListener('click', function() {
        // Obter UTMs da URL atual
        const urlParams = new URLSearchParams(window.location.search);
        const utmParams = new URLSearchParams();
        
        // Copiar todos os parâmetros UTM da URL atual
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
            if (urlParams.has(param)) {
                utmParams.append(param, urlParams.get(param));
            }
        });
        
        // Adicionar o valor restante como parâmetro
        utmParams.append('remaining_value', '49.35');
        
        // URL de checkout (substitua pelo URL real do checkout)
        const checkoutUrl = `https://pay.novopaggamentoseguro.com/checkout/1c7f24b1-e15a-43de-8672-792565374bf3${utmParams.toString() ? '?' + utmParams.toString() : ''}`;
        
        // Redirecionar para a página de checkout
        window.location.href = checkoutUrl;
    });
});
