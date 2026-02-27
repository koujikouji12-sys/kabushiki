# プロジェクト設定

## 作業ディレクトリの制限

**このプロジェクトのルートディレクトリ (`c:\Users\kouit\kabushiki`) 以外のパスに対する操作は一切禁止する。**

### 禁止リスト

以下のパスおよびその配下のファイル・ディレクトリへの読み取り・書き込み・削除・実行は禁止:

- `c:\Users\kouit\` のうち `kabushiki` フォルダ以外のすべて
  - `c:\Users\kouit\.claude\` (メモリファイル等も含め変更禁止)
  - `c:\Users\kouit\Documents\`
  - `c:\Users\kouit\Desktop\`
  - `c:\Users\kouit\AppData\`
  - その他 `kabushiki` 以外のすべてのサブフォルダ
- `c:\Windows\`
- `c:\Program Files\`
- `c:\Program Files (x86)\`
- システムルート配下のその他すべてのディレクトリ

### 許可されるパス

- `c:\Users\kouit\kabushiki\` およびその配下のすべてのファイル・ディレクトリ

### ルール

1. ファイルの読み取り・編集・作成・削除は `c:\Users\kouit\kabushiki\` 配下のみで行う。
2. シェルコマンドで上記禁止パスに触れるコマンドは実行しない。
3. 環境変数やシステム設定の変更は行わない。
4. git 操作はこのリポジトリ (`c:\Users\kouit\kabushiki`) のみに限定する。
