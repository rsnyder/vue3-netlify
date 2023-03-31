<template>
    <div class="wrapper">
        <TopNavbar />

        <main class="form-signin">
            <form>
            <h1 class="h3 mb-3 fw-normal">Please sign in</h1>

            <div class="form-floating">
                <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com">
                <label for="floatingInput">Email address</label>
            </div>
            <div class="form-floating">
                <input type="password" class="form-control" id="floatingPassword" placeholder="Password">
                <label for="floatingPassword">Password</label>
            </div>

            <div class="checkbox mb-3">
                <label>
                <input type="checkbox" value="remember-me"> Remember me
                </label>
            </div>
            <button class="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
            <p class="mt-5 mb-3 text-muted"></p>
            </form>
        </main>

        <Footer />
    </div>
</template>

<script setup>
import TopNavbar from '../../components/TopNavbar.vue';
import Footer from '../../components/Footer.vue';

</script>

<script>
export default {
  components: {
    TopNavbar,
    Footer
  },

  data() {
    return {

    };
  },
};
</script>

<style scoped>
    html,
    body {
    height: 100%;
    }

    body {
    display: flex;
    align-items: center;
    padding-top: 40px;
    padding-bottom: 40px;
    }

    .form-signin {
    width: 100%;
    max-width: 330px;
    padding: 15px;
    margin: 200px auto;
    }

    .form-signin .checkbox {
    font-weight: 400;
    }

    h1 {
    text-align: center;
    color: #e1bee7;
    margin-top: 30px;
    margin-bottom: 30px;
    font-size: 30px;
    font-weight: 100;
    }


    .form-signin .form-floating:focus-within {
    z-index: 2;
    }
    .form-signin .checkbox label {
    color: #E4E4E4;
    }
    .form-signin input {
    font-size: 1.3rem;
    }
    .form-signin input[type="email"] {
    margin-bottom: -1px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    }

    .form-signin input[type="password"] {
    margin-bottom: 10px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    }
</style>