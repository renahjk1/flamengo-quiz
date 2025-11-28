document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const addressForm = document.getElementById('addressForm');
    const cepInput = document.getElementById('cep');
    
    // Abrir modal
    openModalBtn.addEventListener('click', function() {
        modalOverlay.style.display = 'flex';
    });
    
    // Fechar modal
    closeModalBtn.addEventListener('click', function() {
        modalOverlay.style.display = 'none';
    });
    
    // Fechar modal ao clicar fora
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });
    
    // Formatar CEP
    cepInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        this.value = value;
    });
    
    // Buscar CEP
    cepInput.addEventListener('blur', async function() {
        const cep = this.value.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            return;
        }
        
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('rua').value = data.logradouro;
                document.getElementById('bairro').value = data.bairro;
                document.getElementById('cidade').value = data.localidade;
                document.getElementById('estado').value = data.uf;
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    });
    
    // Enviar formulário
    addressForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obter UTMs da URL atual
        const urlParams = new URLSearchParams(window.location.search);
        const utmParams = new URLSearchParams();
        
        // Copiar todos os parâmetros UTM da URL atual
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
            if (urlParams.has(param)) {
                utmParams.append(param, urlParams.get(param));
            }
        });
        
        const queryString = window.location.search; // Get the entire query string
                        const baseUrl = "/loading2";
                        const redirectUrl = baseUrl + queryString;
                        window.location.href = redirectUrl;
    });
});
