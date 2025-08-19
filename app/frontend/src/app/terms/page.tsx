import { BackButton } from "@/components/BackButton"

export default function TermsPage() {
  return (
    <main className="min-h-screen py-8 px-4 md:px-8 lg:px-16 max-w-4xl mx-auto">
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">利用規約</h1>
          <p className="text-muted-foreground">最終更新日: 2025年5月17日</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. はじめに</h2>
          <p>
            本利用規約（以下「本規約」といいます）は、本サービス（以下「本サービス」といいます）の利用条件を定めるものです。
            ユーザーの皆様（以下「ユーザー」といいます）は、本規約に同意の上、本サービスをご利用ください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. ユーザー登録</h2>
          <p>
            本サービスの利用にはユーザー登録が必要です。ユーザーは、真実かつ正確な情報を提供しなければなりません。
            学籍番号およびユーザー名は、本人確認およびサービス利用のために必要です。
          </p>
          <p>
            ユーザーは自己の責任でアカウント情報を管理し、パスワードの漏洩や不正利用を防止する義務を負います。
            不正アクセスや不正利用が判明した場合は、速やかに管理者へ報告してください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. ユーザーの責任と行動規範</h2>
          <p>ユーザーは、本サービスの利用にあたり、以下の行為を行わないものとします：</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>法令または公序良俗に反する行為</li>
            <li>他のユーザーまたは第三者の権利を侵害する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>不正アクセスや不正利用を試みる行為</li>
            <li>虚偽の情報を提供する行為</li>
            <li>営利目的での利用や宣伝行為</li>
            <li>その他、管理者が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. プライバシーとデータの取扱い</h2>
          <p>
            本サービスは、ユーザーから提供された情報を、サービスの提供・改善、ユーザーサポート、法令遵守の目的で利用します。
            個人情報の取扱いについては、別途定めるプライバシーポリシーに従います。
          </p>
          <p>
            ユーザーは、本サービスの利用により、情報の収集・利用・保存に同意したものとみなされます。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. 知的財産権</h2>
          <p>
            本サービスに関する全ての知的財産権は、管理者または正当な権利者に帰属します。
            ユーザーは、サービスを通じて提供されるコンテンツを、個人的かつ非商業的な目的でのみ利用できます。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. 免責事項</h2>
          <p>
            本サービスは「現状有姿」で提供され、管理者はサービスの完全性、正確性、信頼性、有用性等について一切保証しません。
            管理者は、本サービスの利用によって生じたいかなる損害についても、法令で定める場合を除き責任を負いません。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. サービスの変更・中断・終了</h2>
          <p>
            管理者は、事前の通知なく本サービスの内容を変更・中断・終了することができます。
            これらによってユーザーに生じた損害について、管理者は一切責任を負いません。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. 規約の変更</h2>
          <p>
            管理者は、必要と判断した場合、ユーザーへの通知なく本規約を変更することがあります。
            変更後の規約は本ページに掲載された時点で効力を生じます。ユーザーは定期的に本規約を確認してください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. 準拠法と管轄裁判所</h2>
          <p>
            本規約の解釈および適用は日本法に準拠します。
            本サービスに関連して生じた紛争は、管理者所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. セキュリティおよびサービス運用について</h2>
          <p>
            本サービスは十分なセキュリティを保証するものではありません。パスワードには、他のサービスで使用しているものや推測されやすいものを絶対に使用しないでください。
          </p>
          <p>
            また、本サービスは自宅サーバー上で運用されているため、予告なくサービスが停止したり、データが消失する可能性があります。あらかじめご了承ください。
          </p>
        </section>

        <div className="flex justify-center pt-8 pb-4">
          <BackButton fallback="/register" />
        </div>
      </div>
    </main>
  )
}
