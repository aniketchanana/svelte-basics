<script>
    export let message = "this is a modal";
    export let showModal = false;
    export let isPromo = false;
</script>

{#if showModal}
    <div class:promo={isPromo} class="backdrop" on:click|self>
        <div class="modal">
            <slot name="title"></slot>  
            <slot></slot>
        </div>
    </div>
{/if}



<style>
    .backdrop {
        width: 100%;
        height: 100%;
        position: fixed;
        background: rgba(0,0,0,0.8);
    }
    .modal {
        padding: 10px;
        border-radius: 10px;
        max-width: 400px;
        margin: 10% auto;
        max-width: 400px;
        text-align: center;
        background-color: #fff;
    }
    .promo .modal{
        background-color: crimson;
        color: white;
    }
</style>