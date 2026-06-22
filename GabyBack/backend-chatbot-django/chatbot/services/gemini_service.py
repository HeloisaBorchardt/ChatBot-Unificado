# instanciar os objetos da open ia e colocar oque ta no .env

import os
import time
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def chamar_api_chat(prompt):
    # Adapter: encapsula a API do Google Gemini e expõe uma interface simples.
    # Como é usado: traduz chamadas internas do app para a biblioteca externa google.generativeai.

    model = genai.GenerativeModel("gemini-2.5-flash")

    # Tenta chamar a API até 3 vezes caso a cota temporária seja excedida.
    for tentativa in range(3):
        try:
            resposta = model.generate_content(prompt)
            return resposta.text

        except Exception as e:
            # Verifica se o erro é de limite de requisições (erro 429).
            if "429" in str(e):
                print(
                    f"⚠️ Limite do Gemini atingido. "
                    f"Tentativa {tentativa + 1}/3. "
                    f"Aguardando 35 segundos..."
                )

                # Aguarda antes de tentar novamente.
                time.sleep(35)

            else:
                # Se for outro erro, repassa a exceção.
                raise

    # Caso todas as tentativas falhem.
    return (
        "O serviço de IA atingiu o limite temporário de uso. "
        "Tente novamente em alguns instantes."
    )