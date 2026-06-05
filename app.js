document.addEventListener('DOMContentLoaded', () => {
    fetch('produtos.json')
        .then(resposta => resposta.json())
        .then(dados => {
            renderizarCatalogo(dados);
            configurarModal();
        })
        .catch(erro => console.error('Erro ao carregar o catálogo:', erro));
});

function renderizarCatalogo(produtos) {
    const grid = document.getElementById('grid-vitrine');
    
    produtos.forEach(produto => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.style.cursor = 'pointer'; 
        
        // Define a imagem de fundo ou usa um espaço em branco em caso de erro
        const urlImagem = produto.imagem || 'https://via.placeholder.com/300x400.png';
        
        card.innerHTML = `
            <div class="product-image-wrapper" style="background-image: url('${urlImagem}'); background-size: cover; background-position: center;">
                <span class="zoom-badge">Ver Detalhes</span>
            </div>
            <h3 class="product-title">${produto.titulo}</h3>
            <p class="product-material">${produto.material}</p>
        `;
        
        card.addEventListener('click', () => abrirModal(produto));
        
        grid.appendChild(card);
    });
}

function abrirModal(produto) {
    const modal = document.getElementById('produto-modal');
    const zoomContainer = document.getElementById('zoom-container');
    
    // Preenche os textos
    document.getElementById('modal-titulo').textContent = produto.titulo;
    document.getElementById('modal-descricao').textContent = produto.material;
    
    // Simulação de preço (no futuro, você adiciona "preco" no JSON)
    document.getElementById('modal-preco').textContent = 'R$ 189,90';
    
    // Preenche especificações
    document.getElementById('modal-specs').innerHTML = `
        <li><strong>Volume:</strong> ${produto.volume}</li>
        <li><strong>Dimensões:</strong> ${produto.dimensoes}</li>
        <li><strong>Ambiente:</strong> Áreas internas e externas cobertas</li>
    `;
    
    // Configura o link do WhatsApp
    const btnWhats = document.getElementById('modal-whatsapp');
    btnWhats.href = `https://wa.me/SEUNUMERO?text=Olá, quero fechar pedido do ${produto.titulo}.`;
    
    // Configura a imagem de fundo para o zoom (usando imagem temporária para teste)
    const urlImagem = produto.imagem || 'https://via.placeholder.com/1000x1200.png?text=Foto+Alta+Resolucao';
    zoomContainer.style.backgroundImage = `url('${urlImagem}')`;
    
    // Exibe o modal
    modal.style.display = 'flex';
}

function configurarModal() {
    const modal = document.getElementById('produto-modal');
    const btnFechar = document.getElementById('btn-fechar');
    const zoomContainer = document.getElementById('zoom-container');

    // Fechar ao clicar no botão X
    btnFechar.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Fechar ao clicar fora da caixa do modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Lógica matemática do Zoom
    zoomContainer.addEventListener('mousemove', function(e) {
        const dimensao = zoomContainer.getBoundingClientRect();
        
        // Calcula a posição do mouse em relação ao container
        const x = e.clientX - dimensao.left;
        const y = e.clientY - dimensao.top;
        
        // Converte para porcentagem
        const xPercent = Math.round(100 / (dimensao.width / x));
        const yPercent = Math.round(100 / (dimensao.height / y));
        
        // Move o background
        zoomContainer.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    });

    // Reseta a posição quando o mouse sai da imagem
    zoomContainer.addEventListener('mouseleave', function() {
        zoomContainer.style.backgroundPosition = '50% 50%';
    });
}