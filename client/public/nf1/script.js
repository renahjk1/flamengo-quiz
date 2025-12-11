document.addEventListener('DOMContentLoaded', function() {
    const payButton = document.getElementById('payButton');
    
    payButton.addEventListener('click', function() {
        // Obter UTMs da URL atual
        const urlParams = new URLSearchParams(window.location.search);
        const utmParams = new URLSearchParams();
        
        // Copiar todos os parâmetros UTM da URL atual
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'src', 'sck'].forEach(param => {
            if (urlParams.has(param)) {
                utmParams.append(param, urlParams.get(param));
            }
        });
        
        // Adicionar o valor do imposto como parâmetro
        utmParams.append('tax_value', '25.19');
        
        // URL de pagamento PIX interno
        const pagamentoUrl = `/nf1/pagamento.html${utmParams.toString() ? '?' + utmParams.toString() : ''}`;
        
        // Redirecionar para a página de pagamento PIX
        window.location.href = pagamentoUrl;
    });
    
    // Adicionar efeito de hover no botão
    payButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    payButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});
