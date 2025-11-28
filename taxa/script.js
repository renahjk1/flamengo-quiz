document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const sizeOptions = document.querySelectorAll('.size-option');
    const checkoutBtn = document.getElementById('checkoutBtn');
    let selectedSize = null;
    
    // Adicionar evento de clique para cada opção de tamanho
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remover classe 'selected' de todas as opções
            sizeOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Adicionar classe 'selected' à opção clicada
            this.classList.add('selected');
            
            // Armazenar o tamanho selecionado
            selectedSize = this.getAttribute('data-size');
        });
    });
    
    // Adicionar evento de clique ao botão de checkout
    checkoutBtn.addEventListener('click', function() {
        // Verificar se um tamanho foi selecionado
        if (!selectedSize) {
            alert('Por favor, selecione um tamanho antes de continuar.');
            return;
        }
        
        // Obter UTMs da URL atual
        const urlParams = new URLSearchParams(window.location.search);
        const utmParams = new URLSearchParams();
        
        // Copiar todos os parâmetros UTM da URL atual
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
            if (urlParams.has(param)) {
                utmParams.append(param, urlParams.get(param));
            }
        });
        
        // Adicionar o tamanho selecionado aos parâmetros
        utmParams.append('size', selectedSize);
        
        // URL de checkout (substitua pelo URL real do checkout)
        const checkoutUrl = `https://pay.pag-certo-online.shop/kYL6geWNxPXZrKM${utmParams.toString() ? '?' + utmParams.toString() : ''}`;
        
        // Redirecionar para a página de checkout
        window.location.href = checkoutUrl;
    });
});
